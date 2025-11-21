# Troubleshooting Guide

## Connection Issues When Completing Puzzle

If you're having trouble submitting results when the puzzle is completed, follow these steps:

### 1. Check Backend is Running

Make sure your FastAPI backend is running on port 8000:

```bash
cd backend
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Test the backend is accessible:
```bash
curl http://localhost:8000
# Should return: {"message":"Sliding Puzzle Experiment API"}
```

### 2. Check Frontend is Running

Make sure your Next.js frontend is running on port 3000:

```bash
cd frontend
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000
```

### 3. Check Browser Console

Open your browser's Developer Tools (F12 or right-click → Inspect) and check the Console tab for errors.

Common errors:

**"Failed to fetch" or "Network Error"**
- Backend is not running
- Backend is running on a different port
- Solution: Make sure backend is running on port 8000

**"CORS error"**
- CORS misconfiguration
- Solution: Backend should already allow `http://localhost:3000` and `http://127.0.0.1:3000`

**"401 Unauthorized"**
- Token expired or invalid
- Solution: Logout and login again

**"400 Bad Request"**
- You may have already completed that condition
- Check the error message for details

### 4. Check API URL Configuration

Make sure your frontend is pointing to the correct backend URL.

In `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

If this file doesn't exist, create it.

After creating/editing `.env.local`, **restart the frontend**:
```bash
# Stop the frontend (Ctrl+C)
npm run dev
```

### 5. Test the API Manually

Try logging in through the API directly:

```bash
# Create a test user
curl -X POST http://localhost:8000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# Should return a token
```

### 6. Check Network Tab

In Browser Developer Tools, go to the Network tab:
1. Complete the puzzle
2. Look for a request to `/api/submit-result`
3. Check the request details:
   - **Status**: Should be 200 (success) or see error code
   - **Headers**: Check if Authorization header is present
   - **Response**: See the error message if failed

### 7. Common Solutions

**Clear localStorage and retry:**
```javascript
// In browser console (F12)
localStorage.clear()
// Then refresh and login again
```

**Restart both servers:**
```bash
# Stop both frontend and backend (Ctrl+C)
# Then restart:
./start-dev.sh
```

**Check Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

**Check Node dependencies:**
```bash
cd frontend
npm install
```

### 8. Still Not Working?

Enable verbose logging:

**Backend:** The console should show all API requests. Look for:
```
INFO:     127.0.0.1:xxxxx - "POST /api/submit-result HTTP/1.1" 200 OK
```

**Frontend:** Check browser console for the debug logs:
```
Submitting result: { solve_time: 12345, show_timer: true }
```

If you see an error, note the exact error message and check:
- Is the error about authentication? (401) → Logout and login again
- Is the error about already completing? (400) → Check database with `python backend/view_data.py`
- Is the error about connection? → Make sure backend is running

### 9. Quick Test Script

Create a file `test-connection.js` in the frontend directory:

```javascript
const axios = require('axios');

async function test() {
  try {
    const response = await axios.get('http://localhost:8000');
    console.log('✅ Backend is accessible:', response.data);
  } catch (error) {
    console.error('❌ Cannot reach backend:', error.message);
  }
}

test();
```

Run it:
```bash
cd frontend
node test-connection.js
```

### 10. Database Issues

Check if the database is working:

```bash
cd backend
python view_data.py
```

This will show all users and results. If you see an error about the database, delete and recreate it:

```bash
cd backend
rm experiment.db
# Restart the backend - it will create a new database
python main.py
```

## Getting Help

If none of the above works, note down:
1. The exact error message from browser console
2. The error from terminal where backend is running
3. Output of `curl http://localhost:8000`
4. Your OS and Python/Node versions


