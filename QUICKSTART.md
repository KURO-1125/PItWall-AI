# Quick Start Guide

Get PitWall AI up and running in 5 minutes!

## Prerequisites

- Python 3.14+ installed
- Node.js 18+ installed
- Google Gemini API key (get one at https://makersuite.google.com/app/apikey)

## Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/pitwallai.git
cd pitwallai
```

## Step 2: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy ..\.env.example .env  # Windows
# OR
cp ../.env.example .env    # Mac/Linux

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here
```

## Step 3: Start Backend (30 seconds)

```bash
# Make sure you're in the backend directory with venv activated
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

## Step 4: Frontend Setup (2 minutes)

Open a NEW terminal window:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env.local file
copy .env.example .env.local  # Windows
# OR
cp .env.example .env.local    # Mac/Linux
```

## Step 5: Start Frontend (30 seconds)

```bash
# Make sure you're in the frontend directory
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000
- Local:        http://localhost:3000
```

## Step 6: Open the App! 🎉

Open your browser and go to: **http://localhost:3000**

## What to Try First

### 1. Strategy Advisor
- Click "Strategy Advisor" in the sidebar
- Select a race from the dropdown (try "2023 - Abu Dhabi")
- Wait for data to load
- Click the floating "AI Assistant" button to ask questions
- Try the What-If simulator on the left

### 2. Knowledge Base
- Click "Knowledge Base" in the sidebar
- Type a question like "What are the tyre compound rules?"
- Filter by year or category
- Explore the 58 technical documents

### 3. AI Commentary
- Click "AI Commentary" in the sidebar
- Select a race
- Choose a personality style (try "Dramatic Storyteller")
- Click "Generate Commentary"
- Enjoy AI-generated F1 commentary!

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (should be 3.14+)
- Make sure virtual environment is activated
- Verify .env file has GEMINI_API_KEY set

### Frontend won't start
- Check Node version: `node --version` (should be 18+)
- Delete node_modules and run `npm install` again
- Check .env.local has NEXT_PUBLIC_API_URL set

### API errors
- Make sure backend is running on port 8000
- Check browser console for errors
- Verify Gemini API key is valid

### No race data
- First load may take time (FastF1 downloads data)
- Check backend terminal for download progress
- Try a different race if one fails

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design

## Need Help?

- Open an issue on GitHub
- Check existing issues for solutions
- Review the documentation files

---

Happy racing! 🏎️💨
