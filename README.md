# 🏎️ PitWall AI

> AI-powered Formula 1 race strategy analysis platform with real-time data insights, predictive analytics, and intelligent commentary generation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue)](https://www.python.org/)

## 🎯 Overview

PitWall AI brings the power of artificial intelligence to Formula 1 race strategy analysis. Built for students, enthusiasts, and developers, it combines real-time telemetry data with advanced AI to provide insights that rival professional pit wall operations.

### ✨ Key Features

#### 🎮 Strategy Advisor
- **Real-time Race Analysis**: Live strategy recommendations based on current race conditions
- **What-If Scenarios**: Simulate pit stop strategies and predict outcomes
- **Tire Management**: Optimal compound selection and degradation analysis
- **Gap Analysis**: Undercut/overcut viability calculations

#### 📚 Knowledge Base
- **58+ Technical Documents**: Searchable F1 regulations and technical specs
- **RAG-Powered Search**: Semantic search using ChromaDB and embeddings
- **Year-Specific Queries**: Filter by regulation year (2023-2025)
- **AI-Powered Q&A**: Ask questions in natural language

#### 🎙️ AI Commentary
- **5 Personality Styles**: Professional, Dramatic, Technical, Casual, Poetic
- **Race Highlights**: Auto-generated highlight reels with key moments
- **Lap-by-Lap Analysis**: Detailed commentary for specific race segments
- **Driver Focus**: Personalized commentary for your favorite drivers

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **AI/LLM**: Google Gemini 1.5 Pro
- **Vector DB**: ChromaDB for RAG
- **Data Source**: FastF1 (2018-2025 telemetry)
- **Caching**: FastF1 cache for performance

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS + Custom F1 theme
- **Animations**: Framer Motion
- **Charts**: Recharts for data visualization
- **State**: React Hooks

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- Google Gemini API key ([Get one free](https://makersuite.google.com/app/apikey))

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start server
uvicorn app.main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

## 📦 Project Structure

```
PitWall-AI/
├── backend/
│   ├── app/
│   │   ├── engines/          # Strategy analysis engine
│   │   ├── models/           # Pydantic schemas
│   │   ├── routers/          # API endpoints
│   │   ├── services/         # Business logic
│   │   │   ├── fastf1_svc.py    # FastF1 integration
│   │   │   ├── llm.py            # Gemini AI service
│   │   │   ├── knowledge_base.py # RAG system
│   │   │   └── commentary.py     # Commentary generation
│   │   ├── config.py         # Configuration
│   │   └── main.py           # FastAPI app
│   ├── cache/                # FastF1 cache
│   ├── chroma_db/            # Vector database
│   └── requirements.txt
│
├── frontend/
│   ├── app/                  # Next.js app directory
│   │   ├── strategy/         # Strategy advisor page
│   │   ├── knowledge/        # Knowledge base page
│   │   ├── commentary/       # Commentary page
│   │   └── layout.js         # Root layout
│   ├── components/           # React components
│   │   └── strategy/         # Strategy-specific components
│   ├── lib/                  # Utilities
│   │   ├── api.js            # API client
│   │   ├── animations.js     # Framer Motion presets
│   │   └── constants.js      # F1 constants
│   └── package.json
│
├── DEPLOYMENT.md             # Deployment guide
├── README.md                 # This file
└── netlify.toml              # Netlify config
```

## 🌐 Deployment

Deploy for **FREE** using Netlify and Render. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Quick Deploy

1. **Backend** → [Render](https://render.com) (Free tier)
2. **Frontend** → [Netlify](https://netlify.com) (Free tier)

Total cost: **$0/month** ✅

## 🎨 Features in Detail

### Strategy Advisor
The Strategy Advisor uses FastF1 telemetry data combined with Gemini AI to provide:
- Real-time race state analysis
- Tire compound recommendations
- Pit window calculations
- Gap analysis for undercut/overcut opportunities
- Interactive what-if scenario simulator

### Knowledge Base
Powered by RAG (Retrieval Augmented Generation):
- 58+ F1 technical documents embedded in ChromaDB
- Semantic search across regulations
- Year-specific filtering (2023-2025)
- Natural language Q&A with source citations

### AI Commentary
Generate engaging race commentary:
- **Professional**: BBC/Sky Sports style
- **Dramatic**: High-energy, emotional
- **Technical**: Engineering-focused analysis
- **Casual**: Friendly, conversational
- **Poetic**: Artistic, metaphorical

## 🔧 API Endpoints

### Races
- `GET /api/races` - List available races
- `GET /api/races/{session_key}/state` - Get race state
- `GET /api/races/{session_key}/drivers` - Get driver list

### Strategy
- `POST /api/strategy/ask` - Ask strategy questions
- `POST /api/strategy/whatif` - Run what-if scenarios

### Knowledge Base
- `POST /api/knowledge/search` - Search documents
- `POST /api/knowledge/ask` - Ask questions
- `GET /api/knowledge/stats` - Get database stats

### Commentary
- `GET /api/commentary/personalities` - List personalities
- `POST /api/commentary/generate` - Generate commentary
- `POST /api/commentary/highlight-reel` - Generate highlights

Full API docs available at `/docs` when running locally.

## 🤝 Contributing

Contributions are welcome! This is a student project built for learning.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastF1**: For providing comprehensive F1 telemetry data
- **Google Gemini**: For powerful AI capabilities
- **Formula 1**: For the amazing sport that inspired this project
- **Open Source Community**: For the incredible tools and libraries

## 📧 Contact

For questions, suggestions, or collaboration:
- Open an issue on GitHub
- Star the repo if you find it useful!

---

**Built with ❤️ for Formula 1 enthusiasts and AI developers**
