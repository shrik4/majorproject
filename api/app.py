from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
from pymongo import MongoClient
import bcrypt
import jwt
from datetime import datetime, timedelta
from functools import wraps
import csv
import re
import pandas as pd

# Load environment variables
load_dotenv()

# JWT Configuration
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)

if not JWT_SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY not found in .env file!")

app = Flask(__name__)
CORS(app)

# Configure Google Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file!")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# Load student data from CSV
student_data_path = os.path.join(os.path.dirname(__file__), 'All_Students_Data.csv')
students_df = pd.read_csv(student_data_path)

def find_student_by_name(name):
    name = name.lower()
    for _, row in students_df.iterrows():
        if name in row['Name'].lower():
            return {
                'name': row['Name'],
                'usn': row['USN'],
                'year': row['Year'],
                'roll_no': row['Roll.No']
            }
    return None

def is_student_query(query):
    patterns = [
        r"who is ([\w\s]+)\??$",
        r"tell me about ([\w\s]+)\??$",
        r"information about ([\w\s]+)\??$",
        r"details of ([\w\s]+)\??$",
        r"([\w\s]+) details\??$"
    ]
    for pattern in patterns:
        match = re.search(pattern, query, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None

# MongoDB setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client.campus_nav_db
users_collection = db.users

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data or not all(k in data for k in ('fullName', 'email', 'password')):
        return jsonify({'error': 'Missing required fields'}), 400

    if users_collection.find_one({'email': data['email']}):
        return jsonify({'error': 'Email already registered'}), 409

    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

    user_id = users_collection.insert_one({
        'fullName': data['fullName'],
        'email': data['email'],
        'password': hashed_password
    }).inserted_id

    return jsonify({'message': 'User created successfully', 'user_id': str(user_id)}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not all(k in data for k in ('email', 'password')):
        return jsonify({'error': 'Missing email or password'}), 400

    user = users_collection.find_one({'email': data['email']})
    if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = jwt.encode({
        'email': user['email'],
        'exp': datetime.utcnow() + JWT_ACCESS_TOKEN_EXPIRES
    }, JWT_SECRET_KEY, algorithm='HS256')

    # Decode token if necessary (for PyJWT 2.x it returns str)
    if isinstance(token, bytes):
        token = token.decode('utf-8')

    return jsonify({
        'token': token,
        'user': {
            'email': user['email'],
            'fullName': user['fullName']
        }
    })

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization header missing or invalid'}), 401

        token = auth_header.split(' ')[1]

        try:
            data = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
            current_user = users_collection.find_one({'email': data['email']})
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'error': f'Token error: {str(e)}'}), 500

        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/ask', methods=['POST'])
@token_required
def ask(current_user):
    data = request.get_json()
    if not data or 'query' not in data:
        return jsonify({'error': 'No query provided'}), 400

    query = data['query']
    student_name = is_student_query(query)
    if student_name:
        student_info = find_student_by_name(student_name)
        if student_info:
            return jsonify({
                'response': f"Name: {student_info['name']}\nUSN: {student_info['usn']}\nYear: {student_info['year']}\nRoll No: {student_info['roll_no']}"
            })

    try:
        gemini_response = model.generate_content(query)
        return jsonify({'response': gemini_response.text})
    except Exception as e:
        return jsonify({'error': f"Gemini error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
