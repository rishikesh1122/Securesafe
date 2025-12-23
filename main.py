from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from sqlalchemy.orm import Session

from database import SessionLocal, engine
from models import Base, User, File as FileModel
from schemas import UserCreate
from auth import hash_password, verify_password, create_token, decode_token
from encryption import encrypt_data, decrypt_data

import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SecureSafe")

UPLOAD_DIR = "uploads"
ENCRYPTED_DIR = "encrypted"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(ENCRYPTED_DIR, exist_ok=True)

security = HTTPBearer()

# ---------- DB Dependency ----------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------- Auth Dependency ----------
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

# ---------- REGISTER ----------
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = User(
        email=user.email,
        password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()

    return {"message": "User registered successfully"}

# ---------- LOGIN ----------
@app.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(db_user.email)
    return {"access_token": token, "token_type": "bearer"}

# ---------- UPLOAD ----------
@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data = await file.read()
    encrypted = encrypt_data(data)

    path = os.path.join(ENCRYPTED_DIR, file.filename + ".enc")
    with open(path, "wb") as f:
        f.write(encrypted)

    file_record = FileModel(
        filename=file.filename,
        owner_id=user.id
    )
    db.add(file_record)
    db.commit()

    return {"message": "File uploaded securely"}

# ---------- DOWNLOAD ----------
@app.get("/download/{filename}")
def download_file(
    filename: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file_record = db.query(FileModel).filter(
        FileModel.filename == filename,
        FileModel.owner_id == user.id
    ).first()

    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    encrypted_path = os.path.join(ENCRYPTED_DIR, filename + ".enc")
    with open(encrypted_path, "rb") as f:
        encrypted = f.read()

    decrypted = decrypt_data(encrypted)
    decrypted_path = os.path.join(UPLOAD_DIR, filename)

    with open(decrypted_path, "wb") as f:
        f.write(decrypted)

    return FileResponse(decrypted_path, filename=filename)
