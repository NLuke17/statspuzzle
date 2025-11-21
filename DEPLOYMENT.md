# Deployment Guide

This guide will help you deploy your sliding puzzle experiment to production.

## Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Railway account (sign up at https://railway.app) OR Render account (https://render.com)

---

## Option 1: Vercel + Railway (Recommended - Easiest)

### Step 1: Prepare Your Repository

```bash
# Make sure everything is committed
git add .
git commit -m "Prepare for deployment"

# Push to GitHub (create a new repo if needed)
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend to Railway

1. Go to https://railway.app and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Click **"Add variables"** and set:
   ```
   SECRET_KEY=your-random-secret-key-here-change-this
   DATABASE_URL=postgresql://...  (Railway will provide this)
   ```
6. Railway will auto-detect Python and deploy!
7. Note your backend URL: `https://your-app.railway.app`

### Step 3: Update Backend for PostgreSQL

Railway provides PostgreSQL automatically. Update `backend/requirements.txt`:

```txt
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0
python-jose[cryptography]==3.3.0
passlib==1.7.4
bcrypt==4.1.1
python-multipart==0.0.6
psycopg2-binary==2.9.9
```

Update `backend/main.py` to use PostgreSQL:

```python
import os

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./experiment.db")

# Railway provides postgres:// but SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
```

### Step 4: Deploy Frontend to Vercel

1. Go to https://vercel.com and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js
5. Configure:
   - **Root Directory**: `frontend`
   - **Environment Variables**: Add:
     ```
     NEXT_PUBLIC_API_URL=https://your-app.railway.app
     ```
6. Click **"Deploy"**
7. Your site will be live at `https://your-app.vercel.app`

### Step 5: Update CORS in Backend

Update `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://your-app.vercel.app",  # Add your Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push - Railway will auto-redeploy!

---

## Option 2: Render (Alternative)

### Backend on Render

1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - **Name**: sliding-puzzle-backend
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   ```
   SECRET_KEY=your-secret-key
   DATABASE_URL=postgresql://...  (get from Render PostgreSQL)
   ```
6. Deploy!

### Frontend on Vercel (same as above)

---

## Option 3: All-in-One with Railway

You can deploy both frontend and backend on Railway:

1. Deploy backend (as shown above)
2. Create another service for frontend:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variable**: `NEXT_PUBLIC_API_URL=https://backend-url.railway.app`

---

## Security Checklist for Production

### Backend (`backend/main.py`)

✅ Change SECRET_KEY to a random string
✅ Update CORS origins to your production URLs only
✅ Use PostgreSQL instead of SQLite
✅ Add rate limiting (optional but recommended)
✅ Add admin authentication for `/api/results` and `/api/stats`

### Environment Variables

**Backend**:
```
SECRET_KEY=generate-a-long-random-string-here
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

**Frontend**:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Generate a Secret Key

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Custom Domain (Optional)

### For Vercel (Frontend)
1. Go to your project settings
2. Click **"Domains"**
3. Add your custom domain
4. Update DNS records as instructed

### For Railway (Backend)
1. Go to project settings
2. Click **"Domains"**
3. Add custom domain
4. Update DNS CNAME record

---

## Monitoring Your Deployment

### Check Backend Health
```bash
curl https://your-backend.railway.app/
```

Should return:
```json
{"message": "Sliding Puzzle Experiment API"}
```

### Check Frontend
Visit your Vercel URL and test:
1. Sign up with a test account
2. Complete both puzzles
3. Check that data is saved

### View Database (Railway)
1. Go to your Railway project
2. Click on PostgreSQL service
3. Click **"Data"** tab to view tables

---

## Troubleshooting

### Backend won't start
- Check logs in Railway/Render dashboard
- Verify all environment variables are set
- Make sure `requirements.txt` includes `psycopg2-binary`

### CORS errors
- Update `allow_origins` in `backend/main.py`
- Make sure to include your Vercel URL (without trailing slash)
- Redeploy backend after CORS changes

### Database connection failed
- Check `DATABASE_URL` environment variable
- Make sure it starts with `postgresql://` not `postgres://`
- Verify PostgreSQL service is running

### Frontend can't reach backend
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend is running: `curl https://your-backend-url.com/`
- Check browser console for exact error

---

## Cost Estimation

### Free Tier (Hobby Projects)
- **Vercel**: Free (100GB bandwidth/month)
- **Railway**: $5/month credit (usually enough for small apps)
- **Render**: Free tier available (apps sleep after inactivity)

### Paid Tier (Production)
- **Vercel Pro**: $20/month
- **Railway**: Pay per usage (~$5-20/month for small apps)
- **Render**: $7/month for basic web service

---

## Next Steps After Deployment

1. **Test thoroughly** with multiple users
2. **Share the URL** with participants
3. **Monitor the database** for incoming results
4. **Download data regularly** for analysis
5. **Keep backup** of your database

---

## Accessing Your Data

### From Railway Dashboard
```bash
# Get database credentials from Railway
# Then connect with psql or any PostgreSQL client
```

### Export Data to CSV
Add this endpoint to your backend:

```python
@app.get("/api/export-csv")
def export_csv(db: Session = Depends(get_db)):
    results = db.query(Result).all()
    # Convert to CSV format
    # Return as downloadable file
```

Then visit: `https://your-backend.railway.app/api/export-csv`

---

## Support

If you encounter issues:
1. Check deployment logs in your platform's dashboard
2. Verify all environment variables are set
3. Test backend independently before testing full app
4. Check CORS settings if you see network errors

