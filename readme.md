# Sliding Puzzle Experiment

A web application for conducting a statistics experiment to determine if the presence of a timer affects sliding puzzle solve times.

## Project Overview

This project consists of:
- **Frontend**: Next.js React application with TypeScript
- **Backend**: FastAPI Python server
- **Database**: SQLite for storing user data and experiment results

## Experiment Design

This is a **within-subjects** experiment where each participant completes the puzzle under both conditions:
1. **With Timer**: Solve the puzzle with a visible stopwatch
2. **Without Timer**: Solve the puzzle without seeing the time

**Key Features:**
- Participants are **randomly assigned** which condition to complete first (counterbalancing)
- After completing the first puzzle, they automatically proceed to the second condition
- Each condition can only be completed once per user to ensure data integrity
- This design controls for order effects and provides paired data for statistical analysis

## Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

## Features

### Frontend
- ✅ Modern, responsive UI with gradient design
- ✅ User authentication (signup/login)
- ✅ 4x4 sliding puzzle with guaranteed solvable configurations
- ✅ User-selected condition order (within-subjects design)
- ✅ Conditional timer display based on user selection
- ✅ Move counter and solve time tracking
- ✅ Automatic result submission to backend
- ✅ Completion tracking for both conditions

### Backend
- ✅ RESTful API with FastAPI
- ✅ JWT-based authentication
- ✅ Secure password hashing with bcrypt
- ✅ SQLite database with SQLAlchemy ORM
- ✅ CORS enabled for local development
- ✅ User result storage (multiple results per user)
- ✅ Statistics endpoint for data analysis
- ✅ Prevention of duplicate attempts per condition

## API Endpoints

- `POST /api/signup` - Create new user
- `POST /api/login` - Authenticate user
- `GET /api/check-completion` - Check if user completed experiment
- `POST /api/submit-result` - Submit experiment result
- `GET /api/results` - Retrieve all results (admin)
- `GET /api/stats` - Get statistical summary (admin)

## Database Schema

### Users Table
- `id`: Integer (Primary Key)
- `username`: String (Unique)
- `hashed_password`: String
- `created_at`: DateTime

### Results Table
- `id`: Integer (Primary Key)
- `user_id`: Integer
- `username`: String
- `solve_time`: Float (milliseconds)
- `show_timer`: Boolean
- `completed_at`: DateTime

## Data Analysis

Access the results for analysis:

```bash
# Get all results
curl http://localhost:8000/api/results

# Get statistics
curl http://localhost:8000/api/stats
```

The statistics endpoint provides:
- Total number of results
- Mean, min, max solve times for each condition
- Number of participants in each condition

**Note**: This is a within-subjects design, so you can perform paired statistical tests (e.g., paired t-test) on the data since each participant provides results for both conditions.

## Security Notes

⚠️ **Before deploying to production:**

1. Change the `SECRET_KEY` in the backend
2. Use environment variables for sensitive data
3. Set up proper CORS origins (not `*`)
4. Add rate limiting
5. Consider using PostgreSQL instead of SQLite
6. Add admin authentication for results/stats endpoints
7. Use HTTPS

## Technologies Used

### Frontend
- Next.js 14
- React 18
- TypeScript
- Axios for API calls

### Backend
- FastAPI
- SQLAlchemy
- python-jose (JWT)
- passlib (bcrypt)
- SQLite

## License

This project is for educational purposes.

