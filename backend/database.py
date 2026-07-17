import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load configuration from the local .env file inside the backend folder
load_dotenv()

# Default local developer connection string fallback
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:postgres@localhost:5432/ghanaian_cuisine"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency provider to inject database sessions into our API routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()