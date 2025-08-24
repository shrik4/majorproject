from flask import Flask, request, jsonify, session 
from flask_cors import CORS 
import os
from werkzeug.security import generate_password_hash, check_password_hash 
import datetime
from pymongo import MongoClient 

app = Flask(__name__) 
CORS(app,
     supports_credentials=True,
     resources={
         r"/*": {
             "origins": ["http://localhost:8080", "http://localhost:8081"],
             "methods": ["GET", "POST", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"]
         }
     }) 

# Secret Key for session encryption 
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'your_super_secret_key_here') 
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False,
)
app.permanent_session_lifetime = datetime.timedelta(minutes=30) 

client = MongoClient('mongodb://localhost:27017/')
db = client.auth_db
users_collection = db.users
admin_users_collection = db.admin_users 


# ------------------ Normal User ------------------- 
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required!'}), 400

    if users_collection.find_one({'username': username}):
        return jsonify({'message': 'User already exists!'}), 409

    hashed_password = generate_password_hash(password)
    users_collection.insert_one({'username': username, 'password': hashed_password})
    return jsonify({'message': 'User registered successfully!'}), 201 


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required!', 'error': True}), 400

    user = users_collection.find_one({'username': username})

    if not user:
        return jsonify({'message': 'Username not found!', 'error': True}), 401
    elif not check_password_hash(user['password'], password):
        return jsonify({'message': 'Incorrect password!', 'error': True}), 401
    else:



        session['logged_in'] = True
        session['username'] = username
        session.permanent = True
        return jsonify({'message': 'Login successful!', 'error': False}), 200 


@app.route('/logout', methods=['POST']) 
def logout(): 
    session.clear() 
    return jsonify({'message': 'Logout successful!'}), 200 


@app.route('/check_auth', methods=['GET']) 
def check_auth(): 
    if session.get('logged_in'): 
        return jsonify({'is_authenticated': True, 'username': session['username']}), 200 
    else: 
        return jsonify({'is_authenticated': False}), 401 


@app.route('/check_db_connection', methods=['GET'])
def check_db_connection():
    try:
        client.admin.command('ping')
        return jsonify({'message': 'MongoDB connection successful!'}), 200
    except Exception as e:
        return jsonify({'message': f'MongoDB connection failed: {e}'}), 500


# ------------------ Admin User ------------------- 
@app.route('/admin/register', methods=['POST'])
def admin_register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required!'}), 400

    if admin_users_collection.find_one({'username': username}):
        return jsonify({'message': 'Admin user already exists!'}), 409

    hashed_password = generate_password_hash(password)
    admin_users_collection.insert_one({'username': username, 'password': hashed_password})
    return jsonify({'message': 'Admin user registered successfully!'}), 201 


@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required!', 'error': True}), 400

    admin_user = admin_users_collection.find_one({'username': username})

    if not admin_user:
        return jsonify({'message': 'Admin username not found!', 'error': True}), 401
    elif not check_password_hash(admin_user['password'], password):
        return jsonify({'message': 'Incorrect admin password!', 'error': True}), 401
    else:
        session.permanent = True
        session['admin_logged_in'] = True
        session['admin_username'] =  username
        
        return jsonify({'message': 'Admin login successful!', 'error': False}), 200 


@app.route('/admin/check_auth', methods=['GET'])  
def admin_check_auth():  
    if session.get('admin_logged_in'):  
        return jsonify({'is_authenticated': True, 'username': session['admin_username']}), 200  
    else:  
        return jsonify({'is_authenticated': False, 'message': 'Session not found or expired'}), 401 


@app.route('/admin/logout', methods=['POST']) 
def admin_logout(): 
    session.clear() 
    return jsonify({'message': 'Admin logout successful!'}), 200 


if __name__ == '__main__': 
    app.run(host="0.0.0.0", port=5003, debug=True)