import sqlite3

# Connect to the database
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

try:
    # Add the folder column to the files table
    cursor.execute('ALTER TABLE files ADD COLUMN folder TEXT DEFAULT ""')
    conn.commit()
    print("✓ Successfully added 'folder' column to files table")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("✓ Column 'folder' already exists")
    else:
        print(f"✗ Error adding folder column: {e}")

try:
    # Create the folders table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS folders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            owner_email TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    print("✓ Successfully created 'folders' table")
except sqlite3.OperationalError as e:
    print(f"✗ Error creating folders table: {e}")
finally:
    conn.close()
