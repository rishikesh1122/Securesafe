from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)


class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    stored_path = Column(String)
    owner_email = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(String, default="")
    folder = Column(String, default="")
    deleted_at = Column(DateTime, nullable=True)
    size = Column(Integer, default=0)

class Folder(Base):
    __tablename__ = "folders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    owner_email = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
