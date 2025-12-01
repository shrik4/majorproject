from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pymongo import MongoClient
import base64
import io
from datetime import datetime
from bson.objectid import ObjectId

app = Flask(__name__)
CORS(app)

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client.student_results_db
results_collection = db.semester_results

@app.route('/api/semester-results/upload', methods=['POST'])
def upload_result():
    try:
        data = request.json
        
        # Validate required fields
        if not all(k in data for k in ['name', 'usn', 'semester', 'fileName', 'fileData', 'fileType']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if result already exists for this student and semester
        existing = results_collection.find_one({
            'usn': data['usn'].upper(),
            'semester': int(data['semester'])
        })
        
        result_data = {
            'name': data['name'],
            'usn': data['usn'].upper(),
            'semester': int(data['semester']),
            'fileName': data['fileName'],
            'fileData': data['fileData'],  # Base64 encoded
            'fileType': data['fileType'],
            'uploadedAt': datetime.utcnow().isoformat()
        }
        
        if existing:
            # Update existing result
            results_collection.update_one(
                {'_id': existing['_id']},
                {'$set': result_data}
            )
            return jsonify({
                'message': 'Result updated successfully',
                'id': str(existing['_id'])
            }), 200
        else:
            # Insert new result
            result = results_collection.insert_one(result_data)
            return jsonify({
                'message': 'Result uploaded successfully',
                'id': str(result.inserted_id)
            }), 201
            
    except Exception as e:
        print(f"Error uploading result: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/semester-results/search', methods=['GET'])
def search_results():
    try:
        query = request.args.get('query', '').strip()
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        # Search by name or USN (case-insensitive)
        results = list(results_collection.find({
            '$or': [
                {'name': {'$regex': query, '$options': 'i'}},
                {'usn': {'$regex': query, '$options': 'i'}}
            ]
        }))
        
        # Convert ObjectId to string and remove fileData for list view
        for result in results:
            result['_id'] = str(result['_id'])
            result.pop('fileData', None)  # Don't send file data in search results
        
        return jsonify({
            'results': results,
            'count': len(results)
        }), 200
        
    except Exception as e:
        print(f"Error searching results: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/semester-results/download/<result_id>', methods=['GET'])
def download_result(result_id):
    try:
        # Find the result by ID
        result = results_collection.find_one({'_id': ObjectId(result_id)})
        
        if not result:
            return jsonify({'error': 'Result not found'}), 404
        
        # Return the file data
        return jsonify({
            'fileName': result['fileName'],
            'fileData': result['fileData'],
            'fileType': result['fileType']
        }), 200
        
    except Exception as e:
        print(f"Error downloading result: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/semester-results/all', methods=['GET'])
def get_all_results():
    try:
        # Get all results without file data
        results = list(results_collection.find({}, {'fileData': 0}))
        
        for result in results:
            result['_id'] = str(result['_id'])
        
        return jsonify({
            'results': results,
            'count': len(results)
        }), 200
        
    except Exception as e:
        print(f"Error fetching all results: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/semester-results/delete/<result_id>', methods=['DELETE'])
def delete_result(result_id):
    try:
        result = results_collection.delete_one({'_id': ObjectId(result_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Result not found'}), 404
        
        return jsonify({'message': 'Result deleted successfully'}), 200
        
    except Exception as e:
        print(f"Error deleting result: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8017)
