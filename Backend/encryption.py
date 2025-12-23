from cryptography.fernet import Fernet

# ⚠️ For learning purpose (later we improve with password-based key)
KEY = Fernet.generate_key()
cipher = Fernet(KEY)

def encrypt_data(data: bytes) -> bytes:
    return cipher.encrypt(data)

def decrypt_data(data: bytes) -> bytes:
    return cipher.decrypt(data)
