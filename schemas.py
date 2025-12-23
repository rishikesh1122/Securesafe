from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    email: EmailStr

    class Config:
        from_attributes = True


class FileOut(BaseModel):
    filename: str

    class Config:
        from_attributes = True
