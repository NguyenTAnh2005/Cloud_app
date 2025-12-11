from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Status(Base):
    __tablename__ = "statuses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True)
    description = Column(String(255))

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    description = Column(Text)
    status_id = Column(Integer, ForeignKey("statuses.id"))
    
    # Relationship để khi query Task sẽ lấy được luôn thông tin Status
    status = relationship("Status")