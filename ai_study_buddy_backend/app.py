from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=GEMINI_API_KEY)

# Initialize the model
model = genai.GenerativeModel('models/gemini-2.5-flash')

@app.route('/api/study-plan', methods=['POST'])
def generate_study_plan():
    try:
        data = request.json
        print(f"Received study plan request: {data}")
        
        subject = data.get('subject')
        weak_areas = data.get('weakAreas')
        available_time = data.get('availableTime') # e.g., "2 hours per day"
        
        if not all([subject, weak_areas, available_time]):
            return jsonify({'error': 'Missing required fields'}), 400

        prompt = f"""
        Create a personalized study plan for a student studying {subject}.
        Their weak areas are: {weak_areas}.
        They have {available_time} available for studying.
        
        Please provide a structured plan including:
        1. Daily schedule breakdown
        2. Topics to focus on (prioritizing weak areas)
        3. Suggested study techniques
        4. Review intervals
        
        Format the response as a JSON object with the following structure:
        {{
            "schedule": [
                {{"day": "Day 1", "activities": ["activity 1", "activity 2"]}},
                ...
            ],
            "tips": ["tip 1", "tip 2"],
            "resources": ["resource 1", "resource 2"]
        }}
        """
        
        print("Sending request to Gemini API...")
        response = model.generate_content(prompt)
        print(f"Received response from Gemini: {response.text[:100]}...")
        
        # Clean up the response to ensure it's valid JSON
        text_response = response.text.strip()
        if text_response.startswith('```json'):
            text_response = text_response[7:-3]
        elif text_response.startswith('```'):
             text_response = text_response[3:-3]
             
        return jsonify({'plan': text_response})

    except Exception as e:
        print(f"Error generating study plan: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/practice-questions', methods=['POST'])
def generate_practice_questions():
    try:
        data = request.json
        subject = data.get('subject')
        topic = data.get('topic')
        difficulty = data.get('difficulty', 'medium')
        
        if not all([subject, topic]):
            return jsonify({'error': 'Missing required fields'}), 400

        prompt = f"""
        Generate 5 practice questions for the subject '{subject}', specifically on the topic '{topic}'.
        The difficulty level should be '{difficulty}'.
        
        For each question, provide:
        1. The question text
        2. Four multiple-choice options (A, B, C, D)
        3. The correct answer
        4. A brief explanation/hint
        
        Format the response as a JSON array of objects:
        [
            {{
                "id": 1,
                "question": "Question text...",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": "Option A",
                "explanation": "Explanation..."
            }},
            ...
        ]
        """
        
        response = model.generate_content(prompt)
        text_response = response.text.strip()
        if text_response.startswith('```json'):
            text_response = text_response[7:-3]
        elif text_response.startswith('```'):
             text_response = text_response[3:-3]
             
        return jsonify({'questions': text_response})

    except Exception as e:
        print(f"Error generating questions: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/explain-concept', methods=['POST'])
def explain_concept():
    try:
        data = request.json
        concept = data.get('concept')
        context = data.get('context', '')
        
        if not concept:
            return jsonify({'error': 'Missing concept'}), 400

        prompt = f"""
        Explain the concept of '{concept}' in a clear and concise way for a student.
        Context: {context}
        
        Include:
        1. Simple definition
        2. Key points
        3. Real-world example or analogy
        """
        
        response = model.generate_content(prompt)
        return jsonify({'explanation': response.text})

    except Exception as e:
        print(f"Error explaining concept: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=8014, debug=True)
