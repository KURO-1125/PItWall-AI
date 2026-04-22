# PitWall AI

AI-powered Formula 1 race strategy analysis platform with real-time data, predictive analytics, and intelligent commentary generation.

## Features

- **Strategy Advisor**: Real-time race analysis with AI recommendations
- **Knowledge Base**: Search 58+ F1 technical documents with RAG
- **AI Commentary**: Generate race commentary in 5 personality styles

## Tech Stack

**Backend**: FastAPI, Google Gemini, ChromaDB, FastF1  
**Frontend**: Next.js 14, Framer Motion, Recharts

## Local Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
# Create .env with GEMINI_API_KEY
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
# Create .env.local with NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Open http://localhost:3000

## Deployment (FREE)

See [DEPLOYMENT.md](DEPLOYMENT.md) for deploying to:
- **Frontend**: Netlify (free)
- **Backend**: Render (free tier)

## License

MIT License
