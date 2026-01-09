from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, UploadFile, File as FileParam, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse, Response

from database import SessionLocal, engine
from models import User, File as FileModel, Folder
from schemas import UserCreate, FileResponse, FileNotesUpdate, FileFolderUpdate, FolderCreate, FolderResponse
from auth import hash_password, verify_password, create_token, decode_token
from encryption import encrypt_data, decrypt_data

import os
import mimetypes

# Create tables ONCE
from database import Base
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SecureSafe")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # React URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


UPLOAD_DIR = "uploads"
ENCRYPTED_DIR = "encrypted"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(ENCRYPTED_DIR, exist_ok=True)

security = HTTPBearer()

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auth dependency
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    email = decode_token(credentials.credentials)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


@app.get("/")
def root():
    return {"status": "SecureSafe backend running"}

# ---------------- REGISTER ----------------
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="User exists")

    new_user = User(
        email=user.email,
        hashed_password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered"}

# ---------------- LOGIN ----------------
@app.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(db_user.email)
    return {"access_token": token, "token_type": "bearer"}

# ---------------- GET CURRENT USER INFO ----------------
@app.get("/me")
def get_user_info(current_user: User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "id": current_user.id
    }

# ---------------- UPLOAD ----------------
@app.post("/upload")
async def upload_file(
    file: UploadFile = FileParam(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 5 MB

    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 50 MB)")

    encrypted_data = encrypt_data(contents)

    encrypted_path = os.path.join(ENCRYPTED_DIR, file.filename + ".enc")

    with open(encrypted_path, "wb") as f:
        f.write(encrypted_data)

    file_record = FileModel(
        filename=file.filename,
        stored_path=encrypted_path,
        owner_email=current_user.email,
        size=len(contents)  # Store original file size
    )

    db.add(file_record)
    db.commit()

    return {
        "message": "File uploaded successfully",
        "filename": file.filename
    }



# ---------------- DOWNLOAD ----------------
@app.get("/download/{filename}")
def download_file(
    filename: str,
    user=Depends(get_current_user)
):
    path = os.path.join(ENCRYPTED_DIR, filename + ".enc")

    if not os.path.exists(path):
        raise HTTPException(404, "File not found")

    with open(path, "rb") as f:
        encrypted_data = f.read()
    
    decrypted = decrypt_data(encrypted_data)
    
    # Guess the MIME type based on file extension
    mime_type, _ = mimetypes.guess_type(filename)
    if mime_type is None:
        mime_type = "application/octet-stream"

    return Response(
        content=decrypted,
        media_type=mime_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

@app.get("/files", response_model=list[FileResponse])
def list_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    files = db.query(FileModel).filter(
        FileModel.owner_email == current_user.email,
        FileModel.deleted_at == None
    ).all()
    return files

@app.get("/files/deleted", response_model=list[FileResponse])
def list_deleted_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    files = db.query(FileModel).filter(
        FileModel.owner_email == current_user.email,
        FileModel.deleted_at != None
    ).order_by(FileModel.deleted_at.desc()).all()
    return files

@app.delete("/delete/{filename}")
def delete_file(
    filename: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(FileModel).filter(
        FileModel.filename == filename,
        FileModel.owner_email == user.email
    ).first()

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # Soft delete - just mark as deleted
    from datetime import datetime, timezone
    file.deleted_at = datetime.now(timezone.utc)
    db.commit()

    return {"message": "File moved to trash"}

@app.post("/files/{file_id}/restore")
def restore_file(
    file_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(FileModel).filter(
        FileModel.id == file_id,
        FileModel.owner_email == user.email,
        FileModel.deleted_at != None
    ).first()

    if not file:
        raise HTTPException(status_code=404, detail="Deleted file not found")

    file.deleted_at = None
    db.commit()
    db.refresh(file)

    return FileResponse.model_validate(file)

@app.delete("/files/{file_id}/permanent")
def permanent_delete_file(
    file_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(FileModel).filter(
        FileModel.id == file_id,
        FileModel.owner_email == user.email
    ).first()

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # Delete the actual encrypted file
    path = f"encrypted/{file.filename}.enc"
    if os.path.exists(path):
        os.remove(path)

    # Permanently delete from database
    db.delete(file)
    db.commit()

    return {"message": "File permanently deleted"}


@app.patch("/files/{file_id}/notes")
def update_file_notes(
    file_id: int,
    notes_update: FileNotesUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(FileModel).filter(
        FileModel.id == file_id,
        FileModel.owner_email == user.email
    ).first()

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    file.notes = notes_update.notes
    db.commit()
    db.refresh(file)

    return FileResponse.model_validate(file)


@app.patch("/files/{file_id}/folder")
def update_file_folder(
    file_id: int,
    folder_update: FileFolderUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(FileModel).filter(
        FileModel.id == file_id,
        FileModel.owner_email == user.email
    ).first()

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    file.folder = folder_update.folder
    db.commit()
    db.refresh(file)

    return FileResponse.model_validate(file)


@app.post("/folders", response_model=FolderResponse)
def create_folder(
    folder: FolderCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if folder already exists
    existing = db.query(Folder).filter(
        Folder.name == folder.name,
        Folder.owner_email == user.email
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Folder already exists")

    new_folder = Folder(
        name=folder.name,
        owner_email=user.email
    )
    db.add(new_folder)
    db.commit()
    db.refresh(new_folder)

    return new_folder


@app.get("/folders", response_model=list[FolderResponse])
def list_folders(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    folders = db.query(Folder).filter(Folder.owner_email == user.email).all()
    return folders


@app.delete("/folders/{folder_id}")
def delete_folder(
    folder_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_email == user.email
    ).first()

    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    # Move all files in this folder to root
    db.query(FileModel).filter(
        FileModel.folder == folder.name,
        FileModel.owner_email == user.email
    ).update({FileModel.folder: ""})

    db.delete(folder)
    db.commit()

    return {"message": "Folder deleted successfully"}

