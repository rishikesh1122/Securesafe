import sqlite3

# Connect to the database
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

try:
    # Add the notes column to the files table
    cursor.execute('ALTER TABLE files ADD COLUMN notes TEXT DEFAULT ""')
    conn.commit()
    print("✓ Successfully added 'notes' column to files table")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("✓ Column 'notes' already exists")
    else:
        print(f"✗ Error: {e}")
finally:
    conn.close()
