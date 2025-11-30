
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


# --- API Endpoints ---

@app.route('/api/interview/generate-questions', methods=['POST'])
def generate_questions():
    """
    Generates technical interview questions based on provided skills or resume summary.
    """
    if not api_key:
        return jsonify({'error': 'Server is missing the Gemini API key.'}), 500

    data = request.get_json()
    topic = data.get('topic') # Can be skills, job role, or resume summary

    if not topic:
        return jsonify({'error': 'Topic (skills/role) is required.'}), 400

    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        prompt = (
            f"Generate 5 technical interview questions for a candidate with the following skills/background: '{topic}'. "
            "The questions should vary in difficulty (easy to hard). "
            "Return ONLY a JSON array of strings, for example: "
            "[\"Question 1\", \"Question 2\", ...]. Do not include markdown formatting like ```json."
        )

        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean up potential markdown formatting if the model ignores instructions
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
            
        return jsonify({'questions': text})

    except Exception as e:
        print(f'Error generating questions: {e}')
        return jsonify({'error': 'Failed to generate questions.'}), 500

@app.route('/api/interview/evaluate-answer', methods=['POST'])
def evaluate_answer():
    """
    Evaluates a user's answer to a specific interview question.
    """
    if not api_key:
        return jsonify({'error': 'Server is missing the Gemini API key.'}), 500

    data = request.get_json()
    question = data.get('question')
    answer = data.get('answer')

    if not question or not answer:
        return jsonify({'error': 'Question and answer are required.'}), 400

    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        prompt = (
            f"You are a technical interviewer. \n"
            f"Question: \"{question}\"\n"
            f"Candidate's Answer: \"{answer}\"\n\n"
            "Evaluate the answer. Provide:\n"
            "1. A rating (1-10).\n"
            "2. Feedback on what was good.\n"
            "3. Suggestions for improvement.\n"
            "Keep the feedback concise and encouraging. Return the result as a JSON object with keys: 'rating', 'feedback', 'improvement'."
             "Return ONLY the JSON object. Do not include markdown formatting."
        )

        response = model.generate_content(prompt)
        text = response.text.strip()
        
         # Clean up potential markdown formatting
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]

        return jsonify({'evaluation': text})

    except Exception as e:
        print(f'Error evaluating answer: {e}')
        return jsonify({'error': 'Failed to evaluate answer.'}), 500

# --- Start the Server ---
if __name__ == '__main__':
    # Runs the app on http://localhost:8015
    app.run(port=8015, debug=True)
