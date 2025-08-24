from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

import uuid
import os
from models import init_db, create_folder, list_folders, get_folder_by_name, get_folder_by_id, add_file, list_files, get_file_by_unique_name

BASE_DIR = Path(__file__).parent
UPLOAD_DIR = Path('D:\\Desktop\\major project ui\\campus-navigation-navigator\\backend\\uploads')
UPLOAD_DIR.mkdir(exist_ok=True)

init_db()

app = FastAPI()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIMES = {"application/pdf"}

@app.get('/api/folders')
async def api_list_folders():
    return list_folders()

@app.post('/api/folders')
async def api_create_folder(name: str = Form(...), description: str = Form(None)):
    folder_id = create_folder(name.strip(), description)
    if folder_id is None:
        raise HTTPException(status_code=400, detail='Folder already exists')
    # create folder on disk
    folder_path = UPLOAD_DIR / name
    folder_path.mkdir(parents=True, exist_ok=True)
    return {"id": folder_id, "name": name}

@app.post('/api/upload')
async def api_upload(folder_name: str = Form(...), file: UploadFile = File(...)):
    # basic validation
    if file.content_type not in ALLOWED_MIMES:
        raise HTTPException(status_code=400, detail='Only PDF files allowed')

    contents = await file.read()
    print(f"Received {len(contents)} bytes for upload.")
    if len(contents) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail='File too large (max 10MB)')

    # ensure folder exists
    folder = get_folder_by_name(folder_name)
    if not folder:
        raise HTTPException(status_code=404, detail='Folder not found')

    # safe filename
    unique_name = f"{uuid.uuid4().hex}.pdf"
    folder_path = UPLOAD_DIR / folder_name
    dest = folder_path / unique_name
    print(f"Attempting to write {len(contents)} bytes to {dest}")
    with open(dest, 'wb') as f:
        f.write(contents)
    print(f"File written to {dest}. Actual size on disk: {os.path.getsize(dest)} bytes")
    # Add a check for file integrity after writing
    if os.path.getsize(dest) != len(contents):
        print(f"WARNING: Mismatch in file size. Expected {len(contents)} bytes, got {os.path.getsize(dest)} bytes.")

    add_file(folder['id'], unique_name, file.filename, len(contents))
    return {"filename": unique_name, "orig_name": file.filename}

@app.get('/api/folders/{folder_id}/files')
async def api_list_files(folder_id: int):
    return list_files(folder_id)

@app.get('/api/files/{folder_name}/{filename}')
async def api_get_file(folder_name: str, filename: str):
    file_path = UPLOAD_DIR / folder_name / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail='File not found')
    
    file_info = get_file_by_unique_name(filename)
    if not file_info:
        raise HTTPException(status_code=404, detail='File metadata not found')

    return FileResponse(path=file_path, filename=file_info['orig_name'], media_type='application/pdf')