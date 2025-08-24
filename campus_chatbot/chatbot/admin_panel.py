
import os
import pandas as pd
from flask import Blueprint, request, render_template, redirect, url_for, flash, current_app
from werkzeug.utils import secure_filename
from chatbot.document_processor import DocumentProcessor

admin_bp = Blueprint('admin', __name__, template_folder='../templates', static_folder='../static')

# Configuration
UPLOAD_FOLDER = 'd:/Desktop/major project ui/campus-navigation-navigator/campus_chatbot/question_papers'
STUDENT_DATA_FOLDER = 'd:/Desktop/major project ui/campus-navigation-navigator/campus_chatbot/student_data/uploads'
ALLOWED_EXTENSIONS = {'pdf', 'txt'}

# Initialize DocumentProcessor
document_processor = DocumentProcessor()

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@admin_bp.route('/admin')
def admin_panel():
    papers = [f for f in os.listdir(UPLOAD_FOLDER) if allowed_file(f)]
    return render_template('admin.html', papers=papers)

from flask import jsonify

@admin_bp.route('/admin/students')
def view_students():
    try:
        df = pd.read_csv(current_app.config['STUDENT_CSV_PATH'])
        students = df.to_dict(orient='records')
        return jsonify(students)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/upload_student_data', methods=['POST'])
def upload_student_data():
    if 'file' not in request.files:
        flash('No file part')
        return redirect(request.url)
    file = request.files['file']
    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)
    if file and file.filename.endswith('.csv'):
        filename = secure_filename(file.filename)
        if not os.path.exists(STUDENT_DATA_FOLDER):
            os.makedirs(STUDENT_DATA_FOLDER)
        filepath = os.path.join(STUDENT_DATA_FOLDER, filename)
        file.save(filepath)
        try:
            # Read the uploaded CSV into a DataFrame
            new_data = pd.read_csv(filepath)
            
            # Append to the existing CSV file
            new_data.to_csv(current_app.config['STUDENT_CSV_PATH'], mode='a', header=not os.path.exists(current_app.config['STUDENT_CSV_PATH']), index=False)
            
            flash('Student data uploaded and saved successfully!')
        except Exception as e:
            flash(f'Error uploading student data: {e}')
    else:
        flash('Invalid file type. Please upload a CSV file.')
    
    return redirect(url_for('admin.admin_panel'))

@admin_bp.route('/admin/add_student', methods=['POST'])
def add_student():
    try:
        usn = request.form['usn']
        student_name = request.form['student_name']
        year = request.form['year']

        new_student = pd.DataFrame([{'USN': usn, 'Student Name': student_name, 'Year': year}])
        df = pd.read_csv(current_app.config['STUDENT_CSV_PATH'])
        
        # Get the last Sl. No. and increment
        last_sl_no = df['Sl. No.'].max()
        new_student['Sl. No.'] = last_sl_no + 1
        
        # Reorder columns to match the CSV file
        new_student = new_student[['Sl. No.', 'USN', 'Student Name', 'Year']]

        updated_df = pd.concat([df, new_student], ignore_index=True)
        updated_df.to_csv(current_app.config['STUDENT_CSV_PATH'], index=False)

        flash('Student added successfully!')
    except Exception as e:
        flash(f'Error adding student: {e}')
    
    return redirect(url_for('admin.admin_panel'))

@admin_bp.route('/admin/upload', methods=['POST'])
def upload_paper():
    if 'file' not in request.files:
        flash('No file part')
        return redirect(request.url)
    file = request.files['file']
    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        if current_app.chatbot_core.add_question_paper(filepath):
            flash(f'File {filename} uploaded and indexed successfully!')
        else:
            flash(f'File {filename} uploaded but failed to index.')
        return redirect(url_for('admin.admin_panel'))
    else:
        flash('Invalid file type')
        return redirect(request.url)

@admin_bp.route('/admin/delete/<filename>')
def delete_paper(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
        if current_app.chatbot_core.delete_question_paper(filepath):
            flash(f'File {filename} deleted and removed from index.')
        else:
            flash(f'File {filename} deleted but failed to remove from index.')
    else:
        flash(f'File {filename} not found.')
    return redirect(url_for('admin.admin_panel'))

@admin_bp.route('/admin/update/<filename>', methods=['POST'])
def update_paper(filename):
    if 'file' not in request.files:
        flash('No file part')
        return redirect(request.url)
    new_file = request.files['file']
    if new_file.filename == '':
        flash('No selected file')
        return redirect(request.url)
    if new_file and allowed_file(new_file.filename):
        old_filepath = os.path.join(UPLOAD_FOLDER, filename)
        new_filename = secure_filename(new_file.filename)
        new_filepath = os.path.join(UPLOAD_FOLDER, new_filename)
        
        # Remove old file if it exists and is different from new file
        if os.path.exists(old_filepath) and old_filepath != new_filepath:
            os.remove(old_filepath)
            current_app.chatbot_core.delete_question_paper(old_filepath) # Remove old from DB

        new_file.save(new_filepath)
        if current_app.chatbot_core.add_question_paper(new_filepath): # Add new to DB
            flash(f'File {filename} updated to {new_filename} and re-indexed successfully!')
        else:
            flash(f'File {filename} updated but failed to re-index.')
        return redirect(url_for('admin.admin_panel'))
    else:
        flash('Invalid file type')
        return redirect(request.url)