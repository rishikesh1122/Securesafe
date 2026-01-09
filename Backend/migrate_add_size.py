import sqlite3
import os

# Database path
db_path = os.path.join(os.path.dirname(__file__), "database.db")

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Add size column
    cursor.execute("ALTER TABLE files ADD COLUMN size INTEGER DEFAULT 0")
    conn.commit()
    print("✓ Successfully added 'size' column to files table")
    
    # Update existing files with actual file sizes
    cursor.execute("SELECT id, stored_path FROM files")
    files = cursor.fetchall()
    
    for file_id, stored_path in files:
        if os.path.exists(stored_path):
            file_size = os.path.getsize(stored_path)
            cursor.execute("UPDATE files SET size = ? WHERE id = ?", (file_size, file_id))
    
    conn.commit()
    print(f"✓ Updated size for {len(files)} existing files")
    
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower():
        print("✓ Column 'size' already exists")
    else:
        print(f"✗ Error: {e}")
finally:
    conn.close()
