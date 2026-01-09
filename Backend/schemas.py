from pydantic import BaseModel, EmailStr, ConfigDict, field_serializer
from datetime import datetime, timezone

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class FileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    filename: str
    uploaded_at: datetime
    owner_email: str
    notes: str = ""
    folder: str = ""
    deleted_at: datetime | None = None
    size: int = 0
    
    @field_serializer('uploaded_at')
    def serialize_uploaded_at(self, dt: datetime, _info):
        # If datetime is naive (no timezone), treat it as UTC
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()
    
    @field_serializer('deleted_at')
    def serialize_deleted_at(self, dt: datetime | None, _info):
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()

class FileNotesUpdate(BaseModel):
    notes: str

class FileFolderUpdate(BaseModel):
    folder: str

class FolderCreate(BaseModel):
    name: str

class FolderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    owner_email: str
    created_at: datetime
