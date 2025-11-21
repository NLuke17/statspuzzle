# 🚀 Pre-Deployment Checklist

Before deploying your application, make sure you complete these steps:

## 📋 Backend Preparation

- [ ] Install PostgreSQL dependency: `psycopg2-binary` added to `requirements.txt` ✅
- [ ] Update `main.py` to support PostgreSQL ✅
- [ ] Generate a strong SECRET_KEY
- [ ] Set environment variables on hosting platform
- [ ] Test database migrations work with PostgreSQL
- [ ] Update CORS origins to include production URL
- [ ] Remove or secure admin endpoints (`/api/results`, `/api/stats`)

## 📋 Frontend Preparation

- [ ] Set `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Test build locally: `npm run build`
- [ ] Check that all environment variables are prefixed with `NEXT_PUBLIC_`
- [ ] Verify no hardcoded localhost URLs

## 📋 Repository Setup

- [ ] Create GitHub repository
- [ ] Push all code to GitHub
- [ ] Add `.gitignore` to exclude sensitive files ✅
- [ ] Remove any test/debug code
- [ ] Update README with production info

## 📋 Database Setup

- [ ] Provision PostgreSQL database on hosting platform
- [ ] Copy DATABASE_URL to environment variables
- [ ] Test database connection
- [ ] Verify tables are created automatically

## 📋 Security

- [ ] Change SECRET_KEY from default
- [ ] Set strong, unique SECRET_KEY in production
- [ ] Configure CORS for production domain only
- [ ] Review and restrict API endpoints
- [ ] Enable HTTPS (usually automatic on Vercel/Railway)
- [ ] Consider rate limiting for API

## 📋 Testing

- [ ] Test signup flow on production
- [ ] Test login flow on production
- [ ] Complete both puzzle conditions
- [ ] Verify data saves to database
- [ ] Test on mobile device
- [ ] Check browser console for errors
- [ ] Verify timer shows/hides correctly

## 📋 Documentation

- [ ] Update README with production URL
- [ ] Document environment variables needed
- [ ] Write instructions for data export
- [ ] Create user guide if needed

## 🔑 Generate Secret Key

Run this command to generate a secure secret key:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and use it as your SECRET_KEY in production.

## 🌐 Quick Deploy Commands

### Test build locally first:

```bash
# Backend
cd backend
pip install -r requirements.txt
python main.py

# Frontend
cd frontend
npm install
npm run build
npm start
```

### Commit and push:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## 📊 Post-Deployment

- [ ] Monitor error logs
- [ ] Check database for test entries
- [ ] Set up data backup schedule
- [ ] Share URL with participants
- [ ] Monitor performance
- [ ] Plan for data analysis

## ⚠️ Common Issues

**CORS Error**: Make sure ALLOWED_ORIGINS includes your frontend URL
**Database Error**: Check DATABASE_URL format (postgresql:// not postgres://)
**Build Failed**: Check all dependencies are in package.json/requirements.txt
**502 Error**: Backend might be starting up (wait 30 seconds)

## 🎉 You're Ready!

Once all checkboxes are complete, follow the step-by-step guide in DEPLOYMENT.md

