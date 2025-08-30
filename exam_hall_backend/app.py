from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import os
import json
import requests
from werkzeug.utils import secure_filename
import traceback
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configure upload folder - use absolute path
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'csv'}

# Ensure upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Enable debug logging
app.debug = True

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_student_data():
    try:
        # Get the most recent CSV file from the uploads folder
        files = [f for f in os.listdir(UPLOAD_FOLDER) if f.endswith('.csv')]
        if not files:
            return {}
        
        latest_file = max([os.path.join(UPLOAD_FOLDER, f) for f in files], key=os.path.getctime)
        df = pd.read_csv(latest_file)
        
        # Convert DataFrame to dictionary format for easy lookup
        student_data = {}
        for _, row in df.iterrows():
            block_info = row['block'] if 'block' in row and pd.notna(row['block']) else None
            room_info = row['room_number'] if 'room_number' in row and pd.notna(row['room_number']) else None
            seat_info = row['seat_number'] if 'seat_number' in row and pd.notna(row['seat_number']) else None
            
            student_data[str(row['usn']).upper()] = {
                'name': row['name'],
                'regNo': str(row['usn']).upper(),
                'hall': f"Block {block_info}" if block_info else "Not assigned",
                'room': f"Room {room_info}" if room_info else "Not assigned",
                'seat': f"Seat {seat_info}" if seat_info else "Not assigned",
                'semester': row['semester']
            }
        return student_data
    except Exception as e:
        print(f"Error loading student data: {e}")
        return {}

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload for exam hall data."""
    if 'file' not in request.files:
        app.logger.error('No file part in request')
        return jsonify({'error': 'No file part in request'}), 400

    file = request.files['file']
    if file.filename == '':
        app.logger.error('No selected file')
        return jsonify({'error': 'No selected file'}), 400

    if not allowed_file(file.filename):
        app.logger.error('Invalid file type')
        return jsonify({'error': 'Only CSV files are allowed'}), 400

    # Secure the filename and create full path
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    try:
        # Save the file
        file.save(filepath)
        app.logger.info(f'File saved successfully: {filename}')

        # Read and validate CSV
        df = pd.read_csv(filepath)
        required_columns = ['usn', 'name', 'room_number', 'semester']
        missing_columns = [col for col in required_columns if col not in df.columns]

        if missing_columns:
            os.remove(filepath)
            app.logger.error(f'Missing columns: {", ".join(missing_columns)}')
            return jsonify({'error': f'Missing required columns: {", ".join(missing_columns)}'}), 400

        app.logger.info('File validation successful')
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': filename
        }), 200

    except pd.errors.EmptyDataError:
        if os.path.exists(filepath):
            os.remove(filepath)
            app.logger.error('Empty CSV file uploaded')
        return jsonify({'error': 'The uploaded file is empty'}), 400

    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        app.logger.error(f'Error processing file: {str(e)}')
        app.logger.error(traceback.format_exc())
        return jsonify({'error': 'Error processing file'}), 500

@app.route('/delete-data', methods=['DELETE'])
def delete_data():
    """Delete all exam hall allocation data"""
    try:
        # Delete all CSV files in the uploads folder
        files = [f for f in os.listdir(UPLOAD_FOLDER) if f.endswith('.csv')]
        for file in files:
            file_path = os.path.join(UPLOAD_FOLDER, file)
            try:
                os.remove(file_path)
                app.logger.info(f'Deleted file: {file}')
            except Exception as e:
                app.logger.error(f'Error deleting file {file}: {str(e)}')
                continue
        
        return jsonify({'message': 'All exam hall data has been deleted successfully'}), 200
    except Exception as e:
        app.logger.error(f'Error deleting data: {str(e)}')
        return jsonify({'error': 'Failed to delete exam hall data'}), 500

@app.route('/search/<usn>', methods=['GET'])
def search_student(usn):
    student_data = load_student_data()
    student = student_data.get(usn.upper())  # Convert USN to uppercase for consistency
    
    if student:
        # Format the data according to the display requirements
        formatted_student = {
            'name': student['name'],
            'regNo': student['regNo'],  # This will be in uppercase
            'hall': student['hall'],    # Will be in format "Block A" or "Room 101"
            'room': student['room'],    # Will be in format "Room 101"
            'seat': student['seat'],    # Will be in format "Seat 1" or "Not assigned"
            'semester': student['semester']
        }
        return jsonify(formatted_student)
    return jsonify({'error': 'Student not found'}), 404

@app.route('/students', methods=['GET'])
def get_all_students():
    student_data = load_student_data()
    return jsonify(list(student_data.values()))



@app.route('/download-template', methods=['GET'])
def download_template():
    try:
        # Create a sample DataFrame with the required columns
        sample_data = {
            'usn': ['1RV21CS001', '1RV21CS002', '1RV21CS003'],
            'name': ['Student Name 1', 'Student Name 2', 'Student Name 3'],
            'block': ['A', 'B', 'A'],  # Building/Block information
            'room_number': ['101', '102', '103'],  # Room numbers without "Room" prefix
            'seat_number': ['1', '2', '3'],  # Seat numbers
            'semester': [3, 3, 3]
        }
        df = pd.DataFrame(sample_data)
        
        # Save to a temporary file
        template_path = os.path.join(UPLOAD_FOLDER, 'template.csv')
        df.to_csv(template_path, index=False)
        
        # Return the file
        return send_file(
            template_path,
            mimetype='text/csv',
            as_attachment=True,
            download_name='exam_hall_template.csv'
        )
    except Exception as e:
        app.logger.error(f'Error creating template: {str(e)}')
        return jsonify({'error': 'Failed to create template'}), 500

@app.route('/pep-talk/<student_name>', methods=['GET'])
def get_pep_talk(student_name):
    try:
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            return jsonify({'error': 'API key not configured'}), 500

        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={api_key}"
        
        system_prompt = "You are a friendly and encouraging mentor. Your goal is to give a student a short, positive pep talk before their exam."
        user_query = f"Write a short, encouraging, and positive one-paragraph pep talk for a student named {student_name} who is about to take an important exam. Keep it under 60 words and address the student by their name."
        
        payload = {
            "contents": [{"parts": [{"text": user_query}]}],
            "systemInstruction": {
                "parts": [{"text": system_prompt}]
            }
        }

        response = requests.post(
            api_url,
            headers={'Content-Type': 'application/json'},
            json=payload
        )

        if response.ok:
            result = response.json()
            candidate = result.get('candidates', [{}])[0]
            if candidate and candidate.get('content', {}).get('parts', [{}])[0].get('text'):
                return jsonify({'pep_talk': candidate['content']['parts'][0]['text']})
            else:
                return jsonify({'pep_talk': "Couldn't generate a pep talk right now, but you've got this!"})
        else:
            return jsonify({'error': 'Failed to generate pep talk'}), response.status_code

    except Exception as e:
        app.logger.error(f'Error generating pep talk: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(port=5006, debug=True)
