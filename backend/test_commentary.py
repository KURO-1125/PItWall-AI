"""Test commentary generation"""
import asyncio
from app.services.commentary import commentary_service

async def test_commentary():
    # Test with 2023 Abu Dhabi GP (session_key: 202322)
    print("Testing commentary generation for 2023 Abu Dhabi GP...")
    
    result = await commentary_service.generate_commentary(
        session_key=202322,
        personality="professional"
    )
    
    print("\n=== RESULT ===")
    print(f"Personality: {result.get('personality_name')}")
    print(f"Race: {result.get('race_info', {}).get('country')}")
    print(f"Circuit: {result.get('race_info', {}).get('circuit')}")
    print(f"\nCommentary:\n{result.get('commentary')}")
    
    if result.get('error'):
        print(f"\nError: {result.get('error')}")
    
    print("\n\n=== Testing Highlight Reel ===")
    highlight_result = await commentary_service.generate_highlight_reel(
        session_key=202322,
        personality="dramatic"
    )
    
    print(f"Personality: {highlight_result.get('personality_name')}")
    print(f"\nHighlight Commentary:\n{highlight_result.get('commentary')}")
    
    if highlight_result.get('error'):
        print(f"\nError: {highlight_result.get('error')}")

if __name__ == "__main__":
    asyncio.run(test_commentary())
