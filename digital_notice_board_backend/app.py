from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client.digital_notice_board_db
notices_collection = db.notices

@app.route('/api/notices', methods=['GET'])
def get_notices():
    try:
        category = request.args.get('category')
        query = {}
        if category and category != 'All':
            query['category'] = category

        # Sort by pinned (descending) and then by date (descending)
        notices = list(notices_collection.find(query).sort([('isPinned', -1), ('date', -1)]))
        
        for notice in notices:
            notice['_id'] = str(notice['_id'])
        
        return jsonify(notices), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/notices', methods=['POST'])
def create_notice():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        required_fields = ['title', 'content', 'category', 'date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400

        new_notice = {
            'title': data['title'],
            'content': data['content'],
            'category': data['category'],
            'date': data['date'],
            'isPinned': data.get('isPinned', False),
            'createdAt': datetime.utcnow()
        }

        result = notices_collection.insert_one(new_notice)
        new_notice['_id'] = str(result.inserted_id)
        
        return jsonify(new_notice), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/notices/<id>/pin', methods=['PUT'])
def toggle_pin(id):
    try:
        notice = notices_collection.find_one({'_id': ObjectId(id)})
        if not notice:
            return jsonify({'error': 'Notice not found'}), 404
            
        new_pin_status = not notice.get('isPinned', False)
        notices_collection.update_one(
            {'_id': ObjectId(id)},
            {'$set': {'isPinned': new_pin_status}}
        )
        
        return jsonify({'message': 'Pin status updated', 'isPinned': new_pin_status}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/notices/<id>', methods=['DELETE'])
def delete_notice(id):
    try:
        result = notices_collection.delete_one({'_id': ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({'error': 'Notice not found'}), 404
            
        return jsonify({'message': 'Notice deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8023)
