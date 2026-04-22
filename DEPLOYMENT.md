# Deployment Guide (FREE)

Deploy PitWall AI completely FREE using Vercel and Render.

## Prerequisites

- GitHub account
- Google Gemini API key (free at https://makersuite.google.com/app/apikey)

## Step 1: Deploy Backend to Render (FREE)

1. **Sign up**: Go to https://render.com and sign up with GitHub

2. **Create Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select `PItWall-AI`

3. **Configure**:
   - Name: `pitwallai-backend`
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Region: `Oregon (US West)` or any free region
   - Branch: `main`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python run.py`
   - Instance Type: **Free**

4. **Environment Variables** (Click "Advanced" → "Add Environment Variable"):
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   FASTF1_CACHE_DIR=./cache/fastf1
   CHROMA_PERSIST_DIR=./chroma_db
   PYTHON_VERSION=3.11.0
   ```

5. **Deploy**: Click "Create Web Service"
   - Wait 5-10 minutes for first deployment
   - Render will install dependencies and start the server

6. **Copy URL**: Once deployed, note your backend URL (e.g., `https://pitwallai-backend.onrender.com`)

## Step 2: Deploy Frontend to Vercel (FREE)

1. **Sign up**: Go to https://vercel.com and sign up with GitHub

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import `PItWall-AI` repository
   - Root Directory: `frontend`

3. **Configure**:
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Environment Variable**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   ```

5. **Deploy**: Click "Deploy"

6. **Done!**: Your app is live at `https://your-app.vercel.app`

## Step 3: Update Backend CORS

1. Go back to Render dashboard
2. Add environment variable:
   ```
   CORS_ORIGINS=https://your-app.vercel.app
   ```
3. Redeploy backend

## Testing

Visit your Vercel URL and test:
- Strategy Advisor
- Knowledge Base search
- AI Commentary generation

## Important Notes

### Render Free Tier Limitations
- ⚠️ Service sleeps after 15 minutes of inactivity
- ⚠️ First request after sleep takes ~30 seconds to wake up
- ✅ 750 hours/month free (enough for projects)
- ✅ Automatic HTTPS

### Vercel Free Tier
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domains

## Troubleshooting

**Backend 500 errors**:
- Check Render logs
- Verify GEMINI_API_KEY is set
- Ensure CORS_ORIGINS includes your Vercel URL

**Slow first load**:
- Normal for Render free tier (service wakes from sleep)
- Subsequent requests are fast

**Build fails**:
- Check Python version in logs
- Verify all dependencies in requirements.txt

## Cost

**Total: $0/month** ✅

Both services are completely free for student projects and portfolios!

---

**Need help?** Open an issue on GitHub
