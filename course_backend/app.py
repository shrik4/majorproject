from flask import Flask, request, jsonify
from flask_cors import CORS
from pytube import YouTube
import requests
import re

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

courses = []

@app.route('/courses', methods=['GET'])
def get_courses():
    return jsonify(courses)

@app.route('/courses', methods=['POST'])
def add_course():
    new_course = request.json
    youtube_link = new_course.get('youtubeLink')
    if youtube_link:
        try:
            video_id = None
            if "youtu.be/" in youtube_link:
                video_id = youtube_link.split("youtu.be/")[1].split("?")[0]
            elif "youtube.com/watch?v=" in youtube_link:
                video_id = youtube_link.split("watch?v=")[1].split("&")[0]

            if video_id:
                thumbnail_url = f"https://img.youtube.com/vi/{video_id}/0.jpg"
                response = requests.get(thumbnail_url)
                if response.status_code == 200:
                    new_course['thumbnail_url'] = thumbnail_url
                else:
                    new_course['thumbnail_url'] = None
            else:
                new_course['thumbnail_url'] = None
        except Exception as e:
            print(f"Error fetching thumbnail for URL: {youtube_link}")
            print(f"Error: {e}")
            new_course['thumbnail_url'] = None
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
    app.run(debug=True, port=5004)