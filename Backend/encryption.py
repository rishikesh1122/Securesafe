from cryptography.fernet import Fernet
import os

# Use a single persistent Fernet key stored on disk.
# This avoids needing the user's plaintext password at upload time.

KEY_DIR = os.path.join(os.path.dirname(__file__), "storage")
KEY_FILE = os.path.join(KEY_DIR, "fernet.key")

def _load_or_create_key() -> bytes:
    os.makedirs(KEY_DIR, exist_ok=True)
    if os.path.exists(KEY_FILE):
        with open(KEY_FILE, "rb") as f:
            return f.read()
    key = Fernet.generate_key()
    with open(KEY_FILE, "wb") as f:
        f.write(key)
    return key

_FERNET = Fernet(_load_or_create_key())

def encrypt_data(data: bytes) -> bytes:
    return _FERNET.encrypt(data)

def decrypt_data(data: bytes) -> bytes:
    return _FERNET.decrypt(data)
