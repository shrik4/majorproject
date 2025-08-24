import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
import os

import firebase_admin
from firebase_admin import credentials, auth

app = Flask(__name__, static_folder='..\\dist', static_url_path='/')
app.config['SECRET_KEY'] = 'your-secret-key'

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

# Enable CORS
CORS(app)

# Initialize Firebase Admin SDK
# Replace 'path/to/your/serviceAccountKey.json' with the actual path to your Firebase service account key file
# IMPORTANT: Replace 'path/to/your/serviceAccountKey.json' with the actual path to your Firebase service account key file
cred = credentials.Certificate('d:\\Desktop\\major project ui\\campus-navigation-navigator\\database-bafa7-firebase-adminsdk-fbsvc-35de4ceb5b.json')
firebase_admin.initialize_app(cred)

# JWT token required decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        id_token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                id_token = auth_header.split(' ')[1]

        if not id_token:
            return jsonify({'message': 'Firebase ID token is missing!'}), 401

        try:
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token['uid']
            # You can fetch user details from your MongoDB using the UID or email from decoded_token


        except Exception as e:
            print(f"Firebase token verification error: {e}")
            return jsonify({'message': 'Firebase ID token is invalid!', 'error': str(e)}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# Firebase authentication endpoint
@app.route('/api/firebase-auth', methods=['POST'])
def firebase_auth():
    id_token = request.json.get('idToken')

    if not id_token:
        return jsonify({'message': 'ID token is missing!'}), 400

    try:
        # Verify the ID token using the Firebase Admin SDK
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        email = decoded_token['email']
        name = decoded_token.get('name', email.split('@')[0]) # Use email prefix as name if not provided



        # Generate a custom JWT for your backend if needed, or just return user info
        # For simplicity, we'll return user info directly
        return jsonify({
            'message': 'Successfully authenticated with Firebase!',
            'user': {
                'uid': uid,
                'email': email,
                'name': name,
                'role': 'student' # Default role
            }
        }), 200

    except Exception as e:
        print(f"Firebase authentication error: {e}")
        return jsonify({'message': 'Failed to authenticate with Firebase!', 'error': str(e)}), 401

# Root route for React app
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_react_app(path):
    # Check if the requested path is a file that exists in the static folder
    if os.path.exists(os.path.join(app.static_folder, path)) and not os.path.isdir(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    # For all other paths, serve the index.html (SPA fallback)
    return send_from_directory(app.static_folder, 'index.html')
if __name__ == '__main__':
    app.run(debug=True)
