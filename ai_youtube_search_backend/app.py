# To run this Python script, you need to install Flask.
# pip install Flask Flask-CORS google-api-python-client

from flask import Flask, request, jsonify
from flask_cors import CORS
from googleapiclient.discovery import build
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Enable CORS to allow your React app to make requests from this server.
CORS(app)

@app.route('/')
def index():
    return "Flask backend is running!"

# Set your YouTube Data API key here
# It's recommended to load this from an environment variable in a production environment
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

# Configure the Gemini API
# It's recommended to load this from an environment variable in a production environment
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

# This function simulates the "AI" part.
# In a real application, you would use a large language model API here
# to take the user's query and generate a more specific search term.
def generate_ai_query(user_query):
    """
    Takes a user's raw query (e.g., 'CS 101') and transforms it into a
    more effective search query for YouTube (e.g., 'Computer Science 101 full course').
    """
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(f"Generate a concise and effective YouTube search query for: {user_query}")
        return response.text
    except Exception as e:
        print(f"Error generating AI query: {e}")
        return f'Best {user_query} tutorial'

@app.route('/search', methods=['POST'])
def search_youtube():
    """
    API endpoint to handle the search request from the React frontend.
    """
    data = request.get_json()
    user_query = data.get('query', '')
    if not user_query:
        return jsonify({"error": "Query not provided"}), 400

    # Step 1: Use the AI to generate a more refined search query.
    ai_generated_query = generate_ai_query(user_query)

    # Step 2: Use the YouTube Data API to fetch results based on the refined query.
    try:
        search_response = youtube.search().list(
            q=ai_generated_query,
            part='snippet',
            maxResults=5,  # Fetch up to 5 results
            type='video'
        ).execute()

        real_results = []
        for search_result in search_response.get('items', []):
            real_results.append({
                "title": search_result['snippet']['title'],
                "url": f"https://www.youtube.com/watch?v={search_result['id']['videoId']}",
                "thumbnail": search_result['snippet']['thumbnails']['high']['url'],
                "description": search_result['snippet']['description']
            })
         
        # Return the AI-generated query and the real results to the frontend.
        return jsonify({
            "ai_query": ai_generated_query,
            "results": real_results
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8011)