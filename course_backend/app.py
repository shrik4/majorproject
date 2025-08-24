from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

courses = []

@app.route('/courses', methods=['GET'])
def get_courses():
    return jsonify(courses)

@app.route('/courses', methods=['POST'])
def add_course():
    new_course = request.json
    courses.append(new_course)
    return jsonify(new_course), 201

@app.route('/courses/<int:course_id>', methods=['PUT'])
def update_course(course_id):
    updated_course = request.json
    if 0 <= course_id < len(courses):
        courses[course_id] = updated_course
        return jsonify(updated_course)
    return jsonify({'error': 'Course not found'}), 404

@app.route('/courses/<int:course_id>', methods=['DELETE'])
def delete_course(course_id):
    if 0 <= course_id < len(courses):
        del courses[course_id]
        return jsonify({'message': 'Course deleted'})
    return jsonify({'error': 'Course not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5001)