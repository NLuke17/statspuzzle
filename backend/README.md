# Sliding Puzzle Experiment - Backend

FastAPI backend for the sliding puzzle experiment.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file (optional, defaults provided):
```bash
cp .env.example .env
# Edit .env and change SECRET_KEY
```

4. Run the server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Database

The application uses SQLite and stores data in `experiment.db`. The database is automatically created on first run.

### Tables

**users**
- id (primary key)
- username (unique)
- hashed_password
- created_at

**results**
- id (primary key)
- user_id
- username
- solve_time (milliseconds)
- show_timer (boolean)
- completed_at

## Endpoints

- `POST /api/signup` - Create new user account
- `POST /api/login` - Login and get JWT token
- `GET /api/check-completion` - Check if user has completed experiment
- `POST /api/submit-result` - Submit experiment result
- `GET /api/results` - Get all results (admin)
- `GET /api/stats` - Get statistics (admin)


