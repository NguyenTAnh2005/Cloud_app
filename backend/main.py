from typing import Optional

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, engine
from models import Task, Status

app = FastAPI()

# Cấu hình CORS để Frontend gọi được
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency để lấy DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Schemas (Validation dữ liệu)
class TaskCreate(BaseModel):
    title: str
    description: str = ""
    status_id: int = 1


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status_id: Optional[int] = None

# API: Lấy danh sách Task
@app.get("/tasks")
def get_tasks(db: Session = Depends(get_db)):
    result = db.execute(select(Task))
    return result.scalars().all()


# API: Lấy chi tiết Task
@app.get("/tasks/{task_id}")
def get_task(task_id: int, db: Session = Depends(get_db)):
    result = db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

# API: Tạo Task mới
@app.post("/tasks")
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    new_task = Task(title=task.title, description=task.description, status_id=task.status_id)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


# API: Cập nhật Task (title/description/status)
@app.put("/tasks/{task_id}")
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    result = db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    data = payload.model_dump(exclude_unset=True)
    if not data:
        return task

    if "title" in data:
        task.title = data["title"]
    if "description" in data:
        task.description = data["description"]
    if "status_id" in data:
        task.status_id = data["status_id"]

    db.commit()
    db.refresh(task)
    return task

# API: Đổi trạng thái Task (VD: Xong rồi thì chuyển sang Completed)
@app.put("/tasks/{task_id}/status/{status_id}")
def update_status(task_id: int, status_id: int, db: Session = Depends(get_db)):
    result = db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status_id = status_id
    db.commit()
    return {"message": "Updated"}


# API: Xóa Task
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    result = db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"message": "Deleted"}


# API: Lấy danh sách Status (để front sync)
@app.get("/statuses")
def get_statuses(db: Session = Depends(get_db)):
    result = db.execute(select(Status))
    return result.scalars().all()