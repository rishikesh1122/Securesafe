from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class FileResponse(BaseModel):
    filename: str
    uploaded_at: datetime
