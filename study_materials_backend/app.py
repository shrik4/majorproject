from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import json

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Store folder data in a JSON file
FOLDERS_FILE = 'folders.json'
def load_folders():
    if os.path.exists(FOLDERS_FILE):
        with open(FOLDERS_FILE, 'r') as f:
            return json.load(f)
    return {'folders': [], 'next_id': 1}

def save_folders(data):
    with open(FOLDERS_FILE, 'w') as f:
        json.dump(data, f)

# API Routes
@app.route('/api/folders', methods=['GET'])
def get_folders():
    data = load_folders()
    return jsonify(data['folders'])

@app.route('/api/folders', methods=['POST'])
def create_folder():
    data = load_folders()
    folder_data = request.json
    
    # Check if folder name already exists
    if any(f['name'] == folder_data['name'] for f in data['folders']):
        return jsonify({'detail': 'Folder with this name already exists'}), 400
    
    new_folder = {
        'id': data['next_id'],
        'name': folder_data['name'],
        'description': folder_data.get('description', '')
    }
    
    data['folders'].append(new_folder)
    data['next_id'] += 1
    save_folders(data)
    
    # Create physical folder
    folder_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(new_folder['name']))
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    
    return jsonify(new_folder), 201

@app.route('/api/folders/<int:folder_id>/files', methods=['GET'])
def get_files(folder_id):
    data = load_folders()
    folder = next((f for f in data['folders'] if f['id'] == folder_id), None)
    if not folder:
        return jsonify({'detail': 'Folder not found'}), 404
    
    folder_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(folder['name']))
    files = []
    if os.path.exists(folder_path):
        for filename in os.listdir(folder_path):
            file_path = os.path.join(folder_path, filename)
            if os.path.isfile(file_path):
                files.append({
                    'id': hash(filename),  # Simple hash for file ID
                    'folder_id': folder_id,
                    'filename': filename,
                    'orig_name': filename,
                    'size': os.path.getsize(file_path),
                    'uploaded_at': os.path.getctime(file_path)
                })
    return jsonify(files)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'detail': 'No file part'}), 400
    
    file = request.files['file']
    folder_name = request.form.get('folder_name')
    
    if not file or not folder_name:
        return jsonify({'detail': 'Missing file or folder name'}), 400
    
    # Secure the filename
    filename = secure_filename(file.filename)
    folder_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(folder_name))
    
    if not os.path.exists(folder_path):
        return jsonify({'detail': 'Folder not found'}), 404
    
    file_path = os.path.join(folder_path, filename)
    file.save(file_path)
    
    return jsonify({'message': 'File uploaded successfully'}), 200

@app.route('/api/files/<path:folder_name>/<path:filename>')
def download_file(folder_name, filename):
    folder_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(folder_name))
    return send_file(os.path.join(folder_path, secure_filename(filename)))

@app.route('/api/folders/<int:folder_id>', methods=['DELETE'])
def delete_folder(folder_id):
    data = load_folders()
    folder = next((f for f in data['folders'] if f['id'] == folder_id), None)
    if not folder:
        return jsonify({'detail': 'Folder not found'}), 404
    
    # Delete physical folder
    folder_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(folder['name']))
    if os.path.exists(folder_path):
        # Delete all files in the folder
        for filename in os.listdir(folder_path):
            file_path = os.path.join(folder_path, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
        os.rmdir(folder_path)
    
    # Remove folder from data
    data['folders'] = [f for f in data['folders'] if f['id'] != folder_id]
    save_folders(data)
    
    return jsonify({'message': 'Folder deleted successfully'}), 200

@app.route('/api/files/<path:folder_name>/<path:filename>', methods=['DELETE'])
def delete_file(folder_name, filename):
    folder_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(folder_name))
    file_path = os.path.join(folder_path, secure_filename(filename))
    
    if not os.path.exists(file_path):
        return jsonify({'detail': 'File not found'}), 404
    
    try:
        os.remove(file_path)
        return jsonify({'message': 'File deleted successfully'}), 200
    except Exception as e:
        return jsonify({'detail': f'Error deleting file: {str(e)}'}), 500

if __name__ == '__main__':
    # Ensure the upload folder exists
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    
    app.run(host="0.0.0.0", port=5005, debug=True)
