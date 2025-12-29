from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, UploadFile, File as FileParam, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse

from database import SessionLocal, engine
from models import User, File as FileModel
from schemas import UserCreate
from auth import hash_password, verify_password, create_token, decode_token
from encryption import encrypt_data, decrypt_data

import os

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
        owner_email=current_user.email
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

    decrypted = decrypt_data(open(path, "rb").read())

    output = os.path.join(UPLOAD_DIR, filename)
    with open(output, "wb") as f:
        f.write(decrypted)

    return FileResponse(output, filename=filename)
@app.get("/files")
def list_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    files = db.query(FileModel).filter(FileModel.owner_email == current_user.email).all()
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

    path = f"encrypted/{filename}.enc"
    if os.path.exists(path):
        os.remove(path)

    db.delete(file)
    db.commit()

    return {"message": "File deleted successfully"}

