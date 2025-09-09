import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

app = Flask(__name__)
# Enable CORS to allow your React frontend to communicate with this backend
CORS(app)

# Retrieve API credentials from environment variables
API_KEY = os.getenv("RAPIDAPI_KEY")
API_HOST = "jsearch.p.rapidapi.com"
API_URL = f"https://{API_HOST}/search"

@app.route("/search", methods=['GET'])
def search_jobs():
    """
    Endpoint to search for jobs.
    It proxies requests to the JSearch API.
    """
    # Get query parameters from the frontend request
    query = request.args.get('query', 'Software Engineer in Mysuru, India') # Default query
    page = request.args.get('page', '1')

    if not query:
        return jsonify({"error": "A search query is required."}), 400

    if not API_KEY:
        return jsonify({"error": "API key is not configured on the server."}), 500

    querystring = {"query": query, "page": page, "num_pages": "1"}

    headers = {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": API_HOST
    }

    try:
        # Make the request to the external JSearch API
        response = requests.get(API_URL, headers=headers, params=querystring, timeout=10)
        # Raise an exception for bad status codes (4xx or 5xx)
        response.raise_for_status()
        data = response.json()
         
        # The actual job listings are typically inside a 'data' key
        return jsonify(data.get('data', []))

    except requests.exceptions.RequestException as e:
        print(f"Error calling JSearch API: {e}")
        return jsonify({"error": "Failed to fetch data from the job search API."}), 502
    except KeyError:
        return jsonify({"error": "Unexpected response format from the job search API."}), 500

if __name__ == "__main__":
    # Run the Flask app on port 3002 in debug mode
    app.run(port=3002, debug=True)