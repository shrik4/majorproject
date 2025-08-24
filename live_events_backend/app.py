from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

events_data = []

@app.route('/events', methods=['GET'])
def get_events():
    return jsonify(events_data)

@app.route('/events', methods=['POST'])
def add_event():
    new_event = request.json
    events_data.append(new_event)
    return jsonify(new_event), 201

@app.route('/events/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    updated_event = request.json
    if event_id < len(events_data):
        events_data[event_id] = updated_event
        return jsonify(updated_event)
    return jsonify({'error': 'Event not found'}), 404

@app.route('/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    if event_id < len(events_data):
        deleted_event = events_data.pop(event_id)
        return jsonify(deleted_event)
    return jsonify({'error': 'Event not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5001)