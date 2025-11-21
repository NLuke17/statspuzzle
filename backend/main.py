from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
import os

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./experiment.db")

# Railway/Render provide postgres:// but SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create engine with appropriate arguments
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

app = FastAPI(title="Sliding Puzzle Experiment API")

# CORS middleware
# Get allowed origins from environment variable or use defaults
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Result(Base):
    __tablename__ = "results"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    username = Column(String, index=True)
    solve_time = Column(Float)  # in milliseconds
    show_timer = Column(Boolean)
    completed_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models
class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    token: str
    token_type: str = "bearer"

class ResultSubmit(BaseModel):
    solve_time: float
    show_timer: bool

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Helper functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        return username
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

# API Endpoints
@app.get("/")
def read_root():
    return {"message": "Sliding Puzzle Experiment API"}

@app.post("/api/signup", response_model=Token)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create token
    access_token = create_access_token(data={"sub": user.username})
    return {"token": access_token, "token_type": "bearer"}

@app.post("/api/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    # Find user
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Verify password
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Create token
    access_token = create_access_token(data={"sub": user.username})
    return {"token": access_token, "token_type": "bearer"}

@app.get("/api/check-completion")
def check_completion(username: str = Depends(verify_token), db: Session = Depends(get_db)):
    # Get user
    db_user = db.query(User).filter(User.username == username).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check which conditions user has completed
    results = db.query(Result).filter(Result.user_id == db_user.id).all()
    
    completed_with_timer = any(r.show_timer for r in results)
    completed_without_timer = any(not r.show_timer for r in results)
    
    print(f"[DEBUG] User {username} (id={db_user.id}): completed_with_timer={completed_with_timer}, completed_without_timer={completed_without_timer}, total_results={len(results)}")
    for r in results:
        print(f"  - Result id={r.id}, show_timer={r.show_timer}, solve_time={r.solve_time}")
    
    return {
        "completed_with_timer": completed_with_timer,
        "completed_without_timer": completed_without_timer,
        "has_completed_both": completed_with_timer and completed_without_timer
    }

@app.post("/api/submit-result")
def submit_result(
    result_data: ResultSubmit,
    username: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    # Get user
    db_user = db.query(User).filter(User.username == username).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    print(f"[DEBUG] Submitting result for {username}: show_timer={result_data.show_timer}, solve_time={result_data.solve_time}")
    
    # Check if user has already submitted this condition
    existing_result = db.query(Result).filter(
        Result.user_id == db_user.id,
        Result.show_timer == result_data.show_timer
    ).first()
    
    if existing_result:
        condition = "with timer" if result_data.show_timer else "without timer"
        print(f"[DEBUG] User {username} already completed {condition}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You have already completed the experiment {condition}"
        )
    
    # Create new result
    new_result = Result(
        user_id=db_user.id,
        username=username,
        solve_time=result_data.solve_time,
        show_timer=result_data.show_timer,
    )
    db.add(new_result)
    db.commit()
    db.refresh(new_result)
    
    print(f"[DEBUG] Result saved successfully: id={new_result.id}")
    
    return {"message": "Result submitted successfully", "result_id": new_result.id}

@app.get("/api/results")
def get_all_results(db: Session = Depends(get_db)):
    """Get all results for analysis (admin endpoint - should add auth in production)"""
    results = db.query(Result).all()
    return {
        "count": len(results),
        "results": [
            {
                "id": r.id,
                "username": r.username,
                "solve_time": r.solve_time,
                "show_timer": r.show_timer,
                "completed_at": r.completed_at,
            }
            for r in results
        ]
    }

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    """Get basic statistics (admin endpoint)"""
    all_results = db.query(Result).all()
    
    timer_results = [r.solve_time for r in all_results if r.show_timer]
    no_timer_results = [r.solve_time for r in all_results if not r.show_timer]
    
    def calculate_stats(times):
        if not times:
            return None
        return {
            "count": len(times),
            "mean": sum(times) / len(times),
            "min": min(times),
            "max": max(times),
        }
    
    return {
        "total_participants": len(all_results),
        "with_timer": calculate_stats(timer_results),
        "without_timer": calculate_stats(no_timer_results),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

