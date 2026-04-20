"""
PitWall AI — Unified LLM Service
Supports Google Gemini Flash as primary and Ollama (Qwen 2.5) as fallback.
"""
import httpx
import json
import logging
from app.config import settings

logger = logging.getLogger(__name__)


class LLMService:
    """Unified LLM interface — tries Gemini first, falls back to Ollama."""

    def __init__(self):
        self.ollama_url = settings.OLLAMA_BASE_URL
        self.ollama_model = settings.OLLAMA_MODEL
        self.gemini_key = settings.GEMINI_API_KEY

    async def generate(self, prompt: str, system: str = "", temperature: float = 0.7) -> str:
        """Generate a response using the configured LLM provider."""
        # Try Gemini first (faster)
        if self.gemini_key:
            try:
                result = await self._gemini_generate(prompt, system, temperature)
                if result:
                    return result
            except Exception as e:
                logger.warning(f"Gemini failed: {e}. Trying Ollama fallback...")
        
        # Fallback to Ollama
        try:
            result = await self._ollama_generate(prompt, system, temperature)
            if result:
                return result
        except Exception as e:
            logger.error(f"Ollama also failed: {e}")

        return "I'm sorry, I couldn't generate a response. Please check that a Gemini API key is configured or Ollama is running."

    async def _ollama_generate(self, prompt: str, system: str, temperature: float) -> str:
        """Generate using local Ollama (Qwen 2.5:14b-instruct)."""
        payload = {
            "model": self.ollama_model,
            "prompt": prompt,
            "system": system,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_ctx": 8192,
            }
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.ollama_url}/api/generate",
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")

    async def _gemini_generate(self, prompt: str, system: str, temperature: float) -> str:
        """Generate using Google Gemini Flash (free tier)."""
        import google.generativeai as genai

        genai.configure(api_key=self.gemini_key)

        # Combine system and prompt for Gemini
        full_prompt = prompt
        if system:
            full_prompt = f"{system}\n\n{prompt}"
        
        # Use gemini-flash-latest (always points to latest flash model)
        model = genai.GenerativeModel("gemini-flash-latest")
        
        response = model.generate_content(
            full_prompt,
            generation_config={
                "temperature": temperature,
                "max_output_tokens": 2048,
            }
        )
        
        return response.text

    async def health_check(self) -> dict:
        """Check which LLM providers are available."""
        status = {"gemini": False, "ollama": False, "active": None}

        # Check Gemini first (primary)
        if self.gemini_key:
            status["gemini"] = True
            status["active"] = "gemini/gemini-1.5-flash"

        # Check Ollama (fallback)
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                r = await client.get(f"{self.ollama_url}/api/tags")
                if r.status_code == 200:
                    models = [m["name"] for m in r.json().get("models", [])]
                    status["ollama"] = self.ollama_model in models or any(
                        self.ollama_model.split(":")[0] in m for m in models
                    )
                    if status["ollama"] and not status["active"]:
                        status["active"] = f"ollama/{self.ollama_model}"
        except:
            pass

        return status


# Singleton
llm_service = LLMService()
