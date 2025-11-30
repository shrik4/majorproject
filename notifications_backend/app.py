from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import datetime
from dotenv import load_dotenv
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client.notifications_db
notifications_collection = db.notifications
preferences_collection = db.notification_preferences

# Email configuration
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_EMAIL = os.getenv('SMTP_EMAIL')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')

def send_email(to_email, subject, body):
    """Send email using SMTP"""
    try:
        if not SMTP_EMAIL or not SMTP_PASSWORD:
            print("Email credentials not configured")
            return False
            
        msg = MIMEMultipart('alternative')
        msg['From'] = SMTP_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Create HTML version
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                {body}
            </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def get_notification_template(notification_type, data):
    """Get notification template based on type"""
    templates = {
        'low_performance': {
            'subject': '⚠️ Academic Performance Alert - Action Required',
            'body': f"""
Dear {data.get('studentName', 'Student')},

Your recent performance in {data.get('subject', 'a subject')} requires attention. You scored {data.get('marks', 'N/A')} which is below the expected threshold of {data.get('threshold', 40)}.

We recommend:
• Reviewing the subject material
• Attending extra help sessions
• Consulting with your professor

Your academic success is important to us. Please take action to improve your performance.

Best regards,
Academic Team
            """
        },
        'milestone': {
            'subject': '🎉 Congratulations! Academic Achievement',
            'body': f"""
Dear {data.get('studentName', 'Student')},

Congratulations! You've achieved an outstanding milestone:

🏆 {data.get('achievement', 'Top Performer')}

Details:
• Rank: {data.get('rank', 'N/A')}
• Total Marks: {data.get('totalMarks', 'N/A')}
• Department: {data.get('department', 'N/A')}
• Semester: {data.get('semester', 'N/A')}

Keep up the excellent work! Your dedication and hard work are truly commendable.

Best regards,
Academic Team
            """
        },
        'event': {
            'subject': '📅 Upcoming Event Notification',
            'body': f"""
Dear Student,

We would like to remind you about an upcoming event:

Event: {data.get('eventName', 'N/A')}
Date: {data.get('eventDate', 'N/A')}
Time: {data.get('eventTime', 'N/A')}
Venue: {data.get('eventVenue', 'N/A')}

Description:
{data.get('eventDescription', 'No description available')}

We look forward to seeing you there!

Best regards,
Event Management Team
            """
        },
        'deadline': {
            'subject': '⏰ Assignment Deadline Reminder',
            'body': f"""
Dear {data.get('studentName', 'Student')},

This is a reminder about an upcoming assignment deadline:

Assignment: {data.get('assignmentName', 'N/A')}
Subject: {data.get('subject', 'N/A')}
Deadline: {data.get('deadline', 'N/A')}

Please ensure you submit your assignment before the deadline to avoid any penalties.

Best regards,
Academic Team
            """
        }
    }
    
    return templates.get(notification_type, {
        'subject': 'Notification',
        'body': data.get('message', 'You have a new notification.')
    })

@app.route('/api/notifications/send', methods=['POST'])
def send_notification():
    """Send a single notification"""
    try:
        data = request.json
        
        notification_type = data.get('type')
        user_email = data.get('email')
        notification_data = data.get('data', {})
        
        if not user_email or not notification_type:
            return jsonify({'message': 'Email and type are required'}), 400
        
        # Get template
        template = get_notification_template(notification_type, notification_data)
        
        # Send email
        email_sent = send_email(user_email, template['subject'], template['body'])
        
        # Save to database
        notification_record = {
            'userId': data.get('userId'),
            'userEmail': user_email,
            'type': notification_type,
            'title': template['subject'],
            'message': template['body'],
            'status': 'sent' if email_sent else 'failed',
            'sentAt': datetime.datetime.now(),
            'metadata': notification_data
        }
        
        notifications_collection.insert_one(notification_record)
        
        return jsonify({
            'message': 'Notification sent successfully' if email_sent else 'Failed to send notification',
            'status': 'sent' if email_sent else 'failed'
        }), 200 if email_sent else 500
        
    except Exception as e:
        print(f"Error sending notification: {e}")
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@app.route('/api/notifications/bulk', methods=['POST'])
def send_bulk_notifications():
    """Send bulk notifications"""
    try:
        data = request.json
        notifications = data.get('notifications', [])
        
        results = []
        for notif in notifications:
            try:
                notification_type = notif.get('type')
                user_email = notif.get('email')
                notification_data = notif.get('data', {})
                
                template = get_notification_template(notification_type, notification_data)
                email_sent = send_email(user_email, template['subject'], template['body'])
                
                notification_record = {
                    'userId': notif.get('userId'),
                    'userEmail': user_email,
                    'type': notification_type,
                    'title': template['subject'],
                    'message': template['body'],
                    'status': 'sent' if email_sent else 'failed',
                    'sentAt': datetime.datetime.now(),
                    'metadata': notification_data
                }
                
                notifications_collection.insert_one(notification_record)
                results.append({'email': user_email, 'status': 'sent' if email_sent else 'failed'})
            except Exception as e:
                results.append({'email': user_email, 'status': 'error', 'error': str(e)})
        
        return jsonify({'results': results}), 200
        
    except Exception as e:
        print(f"Error sending bulk notifications: {e}")
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@app.route('/api/notifications/history', methods=['GET'])
def get_notification_history():
    """Get notification history"""
    try:
        user_id = request.args.get('userId')
        limit = int(request.args.get('limit', 50))
        
        query = {}
        if user_id:
            query['userId'] = user_id
        
        notifications = list(notifications_collection.find(query).sort('sentAt', -1).limit(limit))
        
        for notif in notifications:
            notif['_id'] = str(notif['_id'])
        
        return jsonify(notifications), 200
        
    except Exception as e:
        print(f"Error fetching notification history: {e}")
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@app.route('/api/notifications/preferences', methods=['POST'])
def update_preferences():
    """Update notification preferences"""
    try:
        data = request.json
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({'message': 'User ID is required'}), 400
        
        preferences_collection.update_one(
            {'userId': user_id},
            {'$set': data},
            upsert=True
        )
        
        return jsonify({'message': 'Preferences updated successfully'}), 200
        
    except Exception as e:
        print(f"Error updating preferences: {e}")
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@app.route('/api/notifications/preferences/<user_id>', methods=['GET'])
def get_preferences(user_id):
    """Get notification preferences"""
    try:
        preferences = preferences_collection.find_one({'userId': user_id})
        
        if preferences:
            preferences['_id'] = str(preferences['_id'])
            return jsonify(preferences), 200
        else:
            # Return default preferences
            default_prefs = {
                'userId': user_id,
                'preferences': {
                    'lowPerformance': {'enabled': True, 'threshold': 40},
                    'deadlines': {'enabled': True, 'hoursBefore': 24},
                    'events': {'enabled': True},
                    'milestones': {'enabled': True}
                }
            }
            return jsonify(default_prefs), 200
        
    except Exception as e:
        print(f"Error fetching preferences: {e}")
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@app.route('/api/notifications/test', methods=['POST'])
def test_notification():
    """Test notification system"""
    try:
        data = request.json
        email = data.get('email')
        
        if not email:
            return jsonify({'message': 'Email is required'}), 400
        
        test_data = {
            'studentName': 'Test Student',
            'subject': 'Test Subject',
            'marks': 35,
            'threshold': 40
        }
        
        template = get_notification_template('low_performance', test_data)
        email_sent = send_email(email, template['subject'], template['body'])
        
        return jsonify({
            'message': 'Test email sent successfully' if email_sent else 'Failed to send test email',
            'status': 'sent' if email_sent else 'failed'
        }), 200 if email_sent else 500
        
    except Exception as e:
        print(f"Error sending test notification: {e}")
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8013)
