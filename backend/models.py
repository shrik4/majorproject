import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / 'db.sqlite'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
    CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    c.execute('''
    CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        folder_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        orig_name TEXT NOT NULL,
        size INTEGER,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(folder_id) REFERENCES folders(id)
    )
    ''')
    conn.commit()
    conn.close()


def get_conn():
    return sqlite3.connect(DB_PATH)

# Helper functions

def list_folders():
    conn = get_conn()
    c = conn.cursor()
    c.execute('SELECT id, name, description, created_at FROM folders ORDER BY created_at DESC')
    rows = c.fetchall()
    conn.close()
    return [dict(id=r[0], name=r[1], description=r[2], created_at=r[3]) for r in rows]


def create_folder(name, description=None):
    conn = get_conn()
    c = conn.cursor()
    try:
        c.execute('INSERT INTO folders (name, description) VALUES (?, ?)', (name, description))
        conn.commit()
        folder_id = c.lastrowid
    except sqlite3.IntegrityError:
        conn.close()
        return None
    conn.close()
    return folder_id


def get_folder_by_name(name):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, description FROM folders WHERE name = ?', (name,))
    folder = cursor.fetchone()
    conn.close()
    return {'id': folder[0], 'name': folder[1], 'description': folder[2]} if folder else None

def get_folder_by_id(folder_id):
    print(f"Attempting to retrieve folder with ID: {folder_id}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, description FROM folders WHERE id = ?', (folder_id,))
    folder = cursor.fetchone()
    conn.close()
    if folder:
        print(f"Folder found in DB: {folder}")
    else:
        print(f"Folder with ID {folder_id} not found in DB by get_folder_by_id.")
    return {'id': folder[0], 'name': folder[1], 'description': folder[2]} if folder else None


def add_file(folder_id, filename, orig_name, size):
    conn = get_conn()
    c = conn.cursor()
    c.execute('INSERT INTO files (folder_id, filename, orig_name, size) VALUES (?, ?, ?, ?)', (folder_id, filename, orig_name, size))
    conn.commit()
    conn.close()


def list_files(folder_id):
    conn = get_conn()
    c = conn.cursor()
    c.execute('SELECT id, filename, orig_name, size, uploaded_at FROM files WHERE folder_id = ? ORDER BY uploaded_at DESC', (folder_id,))
    rows = c.fetchall()
    conn.close()
    return [dict(id=r[0], filename=r[1], orig_name=r[2], size=r[3], uploaded_at=r[4]) for r in rows]


def get_file_by_unique_name(filename):
    conn = get_conn()
    c = conn.cursor()
    c.execute('SELECT id, folder_id, filename, orig_name, size, uploaded_at FROM files WHERE filename = ?', (filename,))
    r = c.fetchone()
    conn.close()
    return dict(id=r[0], folder_id=r[1], filename=r[2], orig_name=r[3], size=r[4], uploaded_at=r[5]) if r else None

def remove_file_from_db(unique_name):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM files WHERE filename = ?', (unique_name,))
    conn.commit()
    conn.close()

def remove_folder_from_db(folder_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Delete all files associated with the folder first
    cursor.execute('DELETE FROM files WHERE folder_id = ?', (folder_id,))
    # Then delete the folder itself
    cursor.execute('DELETE FROM folders WHERE id = ?', (folder_id,))
    conn.commit()
    conn.close()