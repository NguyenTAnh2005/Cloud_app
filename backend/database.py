import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

# Lấy URL từ biến môi trường, mặc định là localhost cho chạy local (synchronous)
DB_URL = os.getenv("DB_URL", "mysql+pymysql://root:ntaMYSQL2005@localhost:3306/task_db")

engine = create_engine(DB_URL, echo=False, future=True, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()