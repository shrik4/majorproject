import os
from flask import Flask, render_template, request, jsonify, send_from_directory, url_for, redirect
from werkzeug.utils import secure_filename
from flask_cors import CORS
from chatbot.chatbot_core import ChatbotCore
from chatbot.admin_panel import admin_bp


def create_app():
    app = Flask(__name__, template_folder='./templates', static_folder='./static')

    # Define paths
    base_dir = os.path.abspath(os.path.dirname(__file__))
    STUDENT_DATA_DIR = os.path.join(base_dir, 'student_data')
    student_csv_paths = [os.path.join(STUDENT_DATA_DIR, f) for f in os.listdir(STUDENT_DATA_DIR) if f.endswith('.csv')]
    FACULTY_CSV_PATH = os.path.join(base_dir, 'student_data', 'uploads', 'faculty_data_updated.csv')
    VECTOR_DB_PATH = os.path.join(base_dir, 'vector_db')
    QUESTION_PAPERS_DIR = os.path.join(base_dir, 'question_papers')
    MODEL_PATH = os.path.join(base_dir, 'models', 'all-MiniLM-L6-v2')

    app.config['SECRET_KEY'] = 'a_very_secret_key_for_flash_messages'
    app.config['STUDENT_CSV_PATHS'] = student_csv_paths
    app.config['QUESTION_PAPERS_DIR'] = QUESTION_PAPERS_DIR
    os.makedirs(QUESTION_PAPERS_DIR, exist_ok=True)

    CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]}})

    # Initialize ChatbotCore
    try:
        chatbot_core = ChatbotCore(student_csv_paths, FACULTY_CSV_PATH, VECTOR_DB_PATH, QUESTION_PAPERS_DIR, MODEL_PATH)
        app.chatbot_core = chatbot_core
        print(f"[DEBUG] GEMINI_API_KEY from app.py: {os.getenv('GEMINI_API_KEY')}")
    except FileNotFoundError as e:
        print(f"ERROR: {e}")
        print("Please make sure the sentence transformer model is downloaded and in the correct directory.")
        # Exit or handle this gracefully
        exit()

    # Register blueprints
    app.register_blueprint(admin_bp)

    @app.route('/')
    def index():
        return redirect(url_for('chatbot_interface'))

    @app.route('/chatbot')
    def chatbot_interface():
        return render_template('chatbot.html')

    @app.route('/api/chat', methods=['POST'])
    def chat():
        user_message = request.json.get('message')
        if not user_message:
            return jsonify({'response': 'Please provide a message.'}), 400

        bot_response = app.chatbot_core.process_query(user_message)

        if isinstance(bot_response, dict) and bot_response.get('action') == 'download':
            filename = bot_response.get('filename')
            if filename:
                download_link = url_for('download_file', filename=filename, _external=True)
                return jsonify({'response': download_link})
            else:
                return jsonify({'response': "I couldn't find a PDF with that name."})

        return jsonify({'response': bot_response})

    @app.route('/download/<filename>')
    def download_file(filename):
        return send_from_directory(app.config['QUESTION_PAPERS_DIR'], filename, as_attachment=True)


    @app.route('/api/question_papers', methods=['GET'])
    def list_question_papers():
        papers = []
        for filename in os.listdir(app.config['QUESTION_PAPERS_DIR']):
            if os.path.isfile(os.path.join(app.config['QUESTION_PAPERS_DIR'], filename)):
                papers.append(filename)
        return jsonify(papers)

    @app.route('/api/question_papers/upload', methods=['POST'])
    def upload_question_paper():
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        if file and (file.filename.endswith('.pdf') or file.filename.endswith('.txt')):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['QUESTION_PAPERS_DIR'], filename)
            file.save(filepath)
            if app.chatbot_core.add_question_paper(filepath):
                return jsonify({'message': f'File {filename} uploaded and indexed successfully!'}), 200
            else:
                return jsonify({'error': f'File {filename} uploaded but failed to index.'}), 500
        return jsonify({'error': 'Invalid file type'}), 400

    @app.route('/api/question_papers/delete/<filename>', methods=['DELETE'])
    def delete_question_paper_api(filename):
        filepath = os.path.join(app.config['QUESTION_PAPERS_DIR'], filename)
        if os.path.exists(filepath):
            os.remove(filepath)
            if app.chatbot_core.delete_question_paper(filepath):
                return jsonify({'message': f'File {filename} deleted and removed from index.'}), 200
            else:
                return jsonify({'error': f'File {filename} deleted but failed to remove from index.'}), 500
        return jsonify({'error': f'File {filename} not found.'}), 404

    @app.route('/api/question_papers/update/<filename>', methods=['PUT'])
    def update_question_paper_api(filename):
        if 'file' not in request.files:
            return jsonify({'error': 'No new file part'}), 400
        new_file = request.files['file']
        if new_file.filename == '':
            return jsonify({'error': 'No selected new file'}), 400
        if new_file and (new_file.filename.endswith('.pdf') or new_file.filename.endswith('.txt')):
            old_filepath = os.path.join(app.config['QUESTION_PAPERS_DIR'], filename)
            new_filename = secure_filename(new_file.filename)
            new_filepath = os.path.join(app.config['QUESTION_PAPERS_DIR'], new_filename)

            # If the new file has a different name, delete the old one first
            if os.path.exists(old_filepath) and old_filepath != new_filepath:
                os.remove(old_filepath)
                app.chatbot_core.delete_question_paper(old_filepath)

            new_file.save(new_filepath)
            if app.chatbot_core.add_question_paper(new_filepath):
                return jsonify({'message': f'File {filename} updated to {new_filename} and re-indexed successfully!'}), 200
            else:
                return jsonify({'error': f'File {filename} updated but failed to re-index.'}), 500
        return jsonify({'error': 'Invalid file type'}), 400

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5002)