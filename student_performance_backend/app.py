from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import datetime
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client.student_performance_db
performance_collection = db.student_performance

@app.route('/api/student-performance', methods=['GET'])
def search_student_performance():
    try:
        search_term = request.args.get('search', '')
        if not search_term:
            return jsonify({'message': 'Search term is required'}), 400

        # Search by name or USN (case-insensitive)
        query = {
            '$or': [
                {'student.name': {'$regex': search_term, '$options': 'i'}},
                {'student.usn': {'$regex': search_term, '$options': 'i'}}
            ]
        }
        
        # Search in both collections
        internal_results = list(performance_collection.find(query))
        assignment_collection = db.assignment_marks
        assignment_results = list(assignment_collection.find(query))
        
        # Convert ObjectId to string for JSON serialization
        for result in internal_results:
            result['_id'] = str(result['_id'])
            result['type'] = 'internal'
        
        for result in assignment_results:
            result['_id'] = str(result['_id'])
            result['type'] = 'assignment'
        
        # Combine results
        all_results = internal_results + assignment_results
        
        return jsonify({'results': all_results}), 200
    except Exception as e:
        print(f"Error searching data: {e}")
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@app.route('/api/student-performance', methods=['POST'])
def save_student_performance():
    try:
        data = request.json
        # Basic validation
        if not data or 'student' not in data or 'internalMarks' not in data:
            return jsonify({'message': 'Invalid data format'}), 400

        # Add timestamp if not present
        if 'uploadedAt' not in data:
            data['uploadedAt'] = datetime.datetime.utcnow().isoformat()

        performance_collection.insert_one(data)
        return jsonify({'message': 'Performance data saved successfully'}), 201
    except Exception as e:
        print(f"Error saving data: {e}")
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@app.route('/api/assignment-marks', methods=['POST'])
def save_assignment_marks():
    try:
        data = request.json
        # Basic validation
        if not data or 'student' not in data or 'assignmentMarks' not in data:
            return jsonify({'message': 'Invalid data format'}), 400

        # Add timestamp if not present
        if 'uploadedAt' not in data:
            data['uploadedAt'] = datetime.datetime.utcnow().isoformat()

        # Store in a separate collection for assignment marks
        assignment_collection = db.assignment_marks
        assignment_collection.insert_one(data)
        return jsonify({'message': 'Assignment marks saved successfully'}), 201
    except Exception as e:
        print(f"Error saving assignment marks: {e}")
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

# Subject Management Endpoints
from bson.objectid import ObjectId

@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    try:
        subjects_collection = db.subjects
        subjects = list(subjects_collection.find())
        for subject in subjects:
            subject['_id'] = str(subject['_id'])
        return jsonify(subjects), 200
    except Exception as e:
        print(f"Error fetching subjects: {e}")
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@app.route('/api/subjects', methods=['POST'])
def add_subject():
    try:
        data = request.json
        if not data or 'name' not in data or 'code' not in data or 'semester' not in data or 'department' not in data:
            return jsonify({'message': 'Invalid data format. Name, Code, Semester, and Department are required.'}), 400
        
        subjects_collection = db.subjects
        result = subjects_collection.insert_one(data)
        data['_id'] = str(result.inserted_id)
        return jsonify(data), 201
    except Exception as e:
        print(f"Error adding subject: {e}")
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@app.route('/api/subjects/<id>', methods=['PUT'])
def update_subject(id):
    try:
        data = request.json
        subjects_collection = db.subjects
        result = subjects_collection.update_one({'_id': ObjectId(id)}, {'$set': data})
        if result.matched_count == 0:
            return jsonify({'message': 'Subject not found'}), 404
        data['_id'] = id
        return jsonify(data), 200
    except Exception as e:
        print(f"Error updating subject: {e}")
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@app.route('/api/subjects/<id>', methods=['DELETE'])
def delete_subject(id):
    try:
        subjects_collection = db.subjects
        result = subjects_collection.delete_one({'_id': ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({'message': 'Subject not found'}), 404
        return jsonify({'message': 'Subject deleted successfully'}), 200
    except Exception as e:
        print(f"Error deleting subject: {e}")
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

# AI-Powered Class Toppers Endpoint
import os
import google.generativeai as genai
import statistics
import json

@app.route('/api/toppers/ai-analysis', methods=['GET'])
def get_ai_toppers():
    try:
        department = request.args.get('department')
        semester = request.args.get('semester')
        
        if not department or not semester:
            return jsonify({'message': 'Department and semester are required'}), 400
        
        # Fetch all students for the given department and semester
        students = list(performance_collection.find({
            'student.department': department,
            'student.semester': int(semester)
        }))
        
        if not students:
            return jsonify({'message': 'No students found for this department and semester'}), 404
        
        # Calculate metrics for each student
        student_metrics = []
        for student_data in students:
            internal_marks = student_data.get('internalMarks', [])
            if not internal_marks:
                continue
                
            total_marks = sum(internal_marks)
            avg_marks = statistics.mean(internal_marks) if internal_marks else 0
            consistency_score = 1 - (statistics.stdev(internal_marks) / avg_marks if avg_marks > 0 and len(internal_marks) > 1 else 0)
            consistency_score = max(0, min(1, consistency_score))  # Clamp between 0 and 1
            
            # Find strong subjects (above average)
            subjects = student_data.get('subjects', [])
            subject_codes = student_data.get('subjectCodes', [])
            strong_subjects = []
            for i, mark in enumerate(internal_marks):
                if mark > avg_marks and i < len(subjects):
                    strong_subjects.append(subjects[i])
            
            student_metrics.append({
                'name': student_data['student']['name'],
                'usn': student_data['student']['usn'],
                'department': department,
                'semester': int(semester),
                'totalMarks': total_marks,
                'averageMarks': round(avg_marks, 2),
                'consistencyScore': round(consistency_score, 2),
                'strongSubjects': strong_subjects[:3],  # Top 3 strong subjects
                'internalMarks': internal_marks,
                'subjects': subjects
            })
        
        # Sort by total marks and get top 3
        student_metrics.sort(key=lambda x: x['totalMarks'], reverse=True)
        top_3 = student_metrics[:3]
        
        # Configure Gemini AI
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            # Fallback: Return data without AI insights
            for i, student in enumerate(top_3):
                student['rank'] = i + 1
                student['aiInsight'] = f"Top performer with {student['totalMarks']} total marks and {student['consistencyScore']} consistency score."
                student['performanceTrend'] = 'stable'
            
            return jsonify({
                'toppers': top_3,
                'overallAnalysis': f"Top 3 students in {department} Semester {semester} based on internal marks.",
                'generatedAt': datetime.datetime.now().isoformat()
            }), 200
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        # Generate AI insights for each topper
        for i, student in enumerate(top_3):
            student['rank'] = i + 1
            
            # Create prompt for AI analysis
            prompt = f"""Analyze this student's performance and provide a brief, insightful summary (2-3 sentences):

Student: {student['name']} (Rank {i+1})
Department: {department}, Semester: {semester}
Total Internal Marks: {student['totalMarks']}
Average Marks: {student['averageMarks']}
Consistency Score: {student['consistencyScore']} (0-1 scale, higher is better)
Strong Subjects: {', '.join(student['strongSubjects']) if student['strongSubjects'] else 'None identified'}
Individual Subject Marks: {student['internalMarks']}

Provide:
1. A brief insight about their performance pattern
2. Whether they show an improving, declining, or stable trend (just say one word: improving/declining/stable)

Format your response as:
INSIGHT: [your insight here]
TREND: [improving/declining/stable]"""

            try:
                response = model.generate_content(prompt)
                ai_text = response.text
                
                # Parse AI response
                if 'INSIGHT:' in ai_text and 'TREND:' in ai_text:
                    insight_part = ai_text.split('TREND:')[0].replace('INSIGHT:', '').strip()
                    trend_part = ai_text.split('TREND:')[1].strip().lower()
                    
                    student['aiInsight'] = insight_part
                    student['performanceTrend'] = trend_part if trend_part in ['improving', 'declining', 'stable'] else 'stable'
                else:
                    student['aiInsight'] = ai_text
                    student['performanceTrend'] = 'stable'
            except Exception as ai_error:
                print(f"AI generation error for student {student['name']}: {ai_error}")
                student['aiInsight'] = f"Excellent performance with {student['totalMarks']} total marks and strong consistency across subjects."
                student['performanceTrend'] = 'stable'
            
            # Remove raw data from response
            del student['internalMarks']
            del student['subjects']
        
        # Generate overall analysis
        overall_prompt = f"""Provide a brief overall analysis (2-3 sentences) of the top 3 students in {department} Semester {semester}:

Top 3 Students:
1. {top_3[0]['name']}: {top_3[0]['totalMarks']} marks, Consistency: {top_3[0]['consistencyScore']}
2. {top_3[1]['name']}: {top_3[1]['totalMarks']} marks, Consistency: {top_3[1]['consistencyScore']} (if exists)
3. {top_3[2]['name']}: {top_3[2]['totalMarks']} marks, Consistency: {top_3[2]['consistencyScore']} (if exists)

Provide key observations about the class performance and these top performers."""

        try:
            overall_response = model.generate_content(overall_prompt)
            overall_analysis = overall_response.text
        except Exception as ai_error:
            print(f"AI generation error for overall analysis: {ai_error}")
            overall_analysis = f"The top 3 students in {department} Semester {semester} demonstrate strong academic performance with consistent marks across subjects."
        
        return jsonify({
            'toppers': top_3,
            'overallAnalysis': overall_analysis,
            'generatedAt': datetime.datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        print(f"Error in AI toppers analysis: {e}")
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8012)
