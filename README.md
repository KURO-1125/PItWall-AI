# PitWall AI

AI-powered Formula 1 race strategy analysis platform with real-time data, predictive analytics, and intelligent commentary generation.

## 🏎️ Features

### 1. Strategy Advisor
- Real-time race state monitoring
- AI-powered strategy recommendations
- Tyre degradation analysis
- What-if scenario simulator
- Interactive chat assistant

### 2. Knowledge Base
- 58+ F1 technical documents (27,000+ chunks)
- RAG-powered intelligent search
- Filter by year, category, and document
- Markdown-formatted responses

### 3. AI Commentary Generator
- 5 personality styles (Professional, Enthusiastic, Technical, Dramatic, Humorous)
- Full race commentary generation
- Highlight reel creation
- Focus on specific drivers or lap ranges

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.14)
- **AI/ML**: Google Gemini (primary), Ollama (fallback)
- **Data Sources**: FastF1 (telemetry), OpenF1 (live data)
- **Vector DB**: ChromaDB (RAG embeddings)
- **Embeddings**: sentence-transformers/all-MiniLM-L6-v2

### Frontend
- **Framework**: Next.js 14 (React)
- **Styling**: CSS Modules + Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **API Client**: Axios

## 📋 Prerequisites

- Python 3.14+
- Node.js 18+
- Google Gemini API key (or Ollama installed locally)

## 🚀 Installation

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
OLLAMA_BASE_URL=http://localhost:11434
FASTF1_CACHE_DIR=./cache/fastf1
CHROMA_PERSIST_DIR=./chroma_db
```

5. Run the backend:
```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the frontend:
```bash
npm run dev
```

5. Open browser at `http://localhost:3000`

## 📁 Project Structure

```
pitwallai/
├── backend/
│   ├── app/
│   │   ├── engines/          # Strategy engine
│   │   ├── models/           # Pydantic schemas
│   │   ├── routers/          # API endpoints
│   │   ├── services/         # Business logic
│   │   │   ├── commentary.py
│   │   │   ├── fastf1_svc.py
│   │   │   ├── knowledge_base.py
│   │   │   └── llm.py
│   │   ├── config.py
│   │   └── main.py
│   ├── cache/                # FastF1 cache (gitignored)
│   ├── chroma_db/           # Vector database (gitignored)
│   ├── requirements.txt
│   └── .env                 # Environment variables (gitignored)
├── frontend/
│   ├── app/
│   │   ├── commentary/      # Commentary generator page
│   │   ├── knowledge/       # Knowledge base page
│   │   ├── strategy/        # Strategy advisor page
│   │   ├── lib/             # Utilities & API client
│   │   ├── globals.css
│   │   └── layout.js
│   ├── components/
│   │   ├── strategy/        # Strategy components
│   │   └── Sidebar.js
│   ├── public/
│   ├── package.json
│   └── .env.local           # Environment variables (gitignored)
├── ARCHITECTURE.md          # System architecture diagrams
├── COMMENTARY_FEATURE.md    # Commentary feature docs
├── KNOWLEDGE_BASE_TECHNICAL_DOC.md
└── README.md
```

## 🔑 API Endpoints

### Races
- `GET /api/races` - List available sessions
- `GET /api/races/{session_key}/state` - Get race state
- `GET /api/races/{session_key}/drivers` - Get drivers
- `GET /api/races/{session_key}/laps` - Get lap data

### Strategy
- `POST /api/strategy/ask` - Ask strategy question
- `POST /api/strategy/whatif` - Run what-if scenario

### Knowledge Base
- `GET /api/knowledge/stats` - Get KB statistics
- `POST /api/knowledge/query` - Query knowledge base
- `GET /api/knowledge/years` - Get available years
- `GET /api/knowledge/categories` - Get categories
- `GET /api/knowledge/documents` - Get documents

### Commentary
- `GET /api/commentary/personalities` - Get personality styles
- `POST /api/commentary/generate` - Generate commentary
- `POST /api/commentary/highlight-reel` - Generate highlights

## 🎨 Features in Detail

### Strategy Advisor
- Select any F1 race from 2023-2026
- View live race positions and timing
- Ask natural language questions about strategy
- Run what-if scenarios (pit stops, tyre changes)
- Floating AI chat assistant

### Knowledge Base
- Search across 58 F1 technical documents
- Filter by year (2022-2024), category, document
- RAG-powered semantic search
- Markdown-formatted responses with sources

### Commentary Generator
- Choose from 5 personality styles
- Generate full race commentary or highlights
- Focus on specific drivers or lap ranges
- Natural, engaging F1 commentary

## 🧪 Testing

### Backend
```bash
cd backend
python test_gemini.py
python test_commentary.py
```

### Frontend
```bash
cd frontend
npm run build
```

## 📝 Environment Variables

### Backend (.env)
```env
GEMINI_API_KEY=your_api_key
OLLAMA_BASE_URL=http://localhost:11434
FASTF1_CACHE_DIR=./cache/fastf1
CHROMA_PERSIST_DIR=./chroma_db
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- FastF1 for telemetry data
- OpenF1 for live race data
- Google Gemini for AI capabilities
- F1 technical regulations documents

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ for F1 fans and data enthusiasts
