import sqlite3

# Connect to the database
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

try:
    # Add the deleted_at column to the files table
    cursor.execute('ALTER TABLE files ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL')
    conn.commit()
    print("✓ Successfully added 'deleted_at' column to files table")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("✓ Column 'deleted_at' already exists")
    else:
        print(f"✗ Error: {e}")
finally:
    conn.close()
