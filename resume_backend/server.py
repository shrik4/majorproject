# This server, built with Python and Flask, acts as a secure intermediary 
# between your React frontend and the Google Gemini API. It exposes a single 
# endpoint /api/enhance that takes a job description and returns an 
# AI-enhanced version. 

import os 
from flask import Flask, request, jsonify 
from flask_cors import CORS 
import google.generativeai as genai 
from dotenv import load_dotenv 

# --- Initialization --- 
load_dotenv()  # Load environment variables from a .env file 
app = Flask(__name__) 
CORS(app)  # Enable Cross-Origin Resource Sharing for the app 

# --- Gemini API Configuration --- 
# Make sure you have a .env file in the same directory as this server file 
# with your API key like this: GEMINI_API_KEY=your_api_key_here 
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY is not set. The AI features will not work.") 
else: 
    try: 
        genai.configure(api_key=api_key) 
    except Exception as e: 
        print(f"Error configuring Gemini API: {e}") 


# --- API Endpoint --- 
@app.route('/api/enhance', methods=['POST']) 
def enhance_description(): 
    """ 
    Receives a job description and returns an enhanced version from the Gemini API. 
    """ 
    if not api_key: 
        return jsonify({'error': 'Server is missing the Gemini API key.'}), 500 

    data = request.get_json() 
    description = data.get('description') 

    if not description: 
        return jsonify({'error': 'Job description is required.'}), 400 

    try: 
        # Initialize the model (it's good practice to do this once if the app were larger, 
        # but for a single endpoint, this is fine) 
        model = genai.GenerativeModel('models/gemini-2.5-flash') 

        # The prompt for the AI model 
        prompt = ( 
            "Rewrite the following job description into 3-4 professional, " 
            "action-oriented bullet points for a resume. Focus on achievements and impact. " 
            "Start each bullet point with an action verb. Do not use any introductory phrases. " 
            "Output only the bullet points, each on a new line.\n\n" 
            f'Original description:\n"{description}"' 
        ) 

        # Call the Gemini API 
        response = model.generate_content(prompt) 
        enhanced_text = response.text 

        # Send the enhanced text back to the frontend 
        return jsonify({'enhancedText': enhanced_text}) 

    except Exception as e: 
        print(f'Error calling Gemini API: {e}') 
        return jsonify({'error': 'Failed to enhance description with AI.'}), 500 

# --- Start the Server --- 
if __name__ == '__main__': 
    # Runs the app on http://localhost:3001 
    app.run(port=3001, debug=True)