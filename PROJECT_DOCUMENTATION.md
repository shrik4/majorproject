# Campus Connect - Project Documentation

## Project Overview
Campus Connect is a comprehensive campus management system that integrates multiple services to create a unified platform for students, faculty, and administrators. The system combines AI-powered assistance, resource management, and real-time information tracking to enhance the campus experience.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn-ui
- **Styling**: Tailwind CSS
- **Port**: 5173

### Backend Services

1. **API Backend (Port 5000)**
   - General API services
   - Request handling and routing
   - Data validation and processing

2. **Authentication Backend (Port 5001)**
   - User authentication and authorization
   - Session management
   - Role-based access control
   - Admin privileges handling

3. **Campus Chatbot (Port 5002)**
   - AI-powered student assistance
   - Natural language processing
   - Query handling and responses
   - Integration with campus services
   - Document processing capabilities
   - Student and faculty information search

4. **Course Backend (Port 5003)**
   - Course information management
   - Course listings and details
   - Course material organization
   - Academic information handling

5. **Live Events Backend (Port 5004)**
   - Real-time event tracking
   - Event notifications
   - Campus activity monitoring
   - Event management system

6. **Study Materials Backend (Port 5005)**
   - File management system
   - Resource organization
   - Document storage and retrieval
   - Access control for materials

7. **Exam Hall Backend (Port 5006)**
   - Exam hall allocation
   - Seating arrangement management
   - Student data processing
   - CSV file handling for exam data

## Core Features

### 1. AI Chatbot System
- Interactive campus assistant
- Natural language understanding
- Contextual responses
- Integration with campus database
- Real-time query processing
- Student and faculty search capabilities
- Document-based information retrieval

### 2. Study Materials Management
- Organized file structure
- Easy upload and download
- Category-based organization
- Search functionality
- Access control
- Version control
- File format support

### 3. Course Information System
- Detailed course catalogs
- Course schedule management
- Material distribution
- Progress tracking
- Faculty assignment
- Course updates and notifications

### 4. Live Events Tracking
- Real-time event updates
- Event calendar
- Location tracking
- Attendance monitoring
- Event registration
- Notification system

### 5. Exam Hall Management
- Automated seating allocation
- Room capacity management
- Student data processing
- CSV file support
- Block and room assignment
- Seat number generation
- Data validation and error handling

### 6. Admin Dashboard
- Comprehensive control panel
- User management
- Content moderation
- System monitoring
- Analytics and reporting
- Backup and restore capabilities

## Technical Details

### Database Structure
- Student information storage
- Course data management
- Event tracking tables
- User authentication records
- File management system
- Exam hall allocation data

### API Endpoints

#### Authentication Endpoints
- POST /auth/login
- POST /auth/logout
- POST /auth/register
- GET /auth/verify

#### Chatbot Endpoints
- POST /chatbot/query
- GET /chatbot/history
- POST /chatbot/feedback

#### Course Endpoints
- GET /courses
- POST /courses/add
- PUT /courses/update
- DELETE /courses/remove

#### Events Endpoints
- GET /events/live
- POST /events/create
- PUT /events/update
- DELETE /events/cancel

#### Study Materials Endpoints
- GET /materials
- POST /materials/upload
- DELETE /materials/remove
- GET /materials/download

#### Exam Hall Endpoints
- POST /upload
- GET /students
- GET /search/:usn
- DELETE /delete-data
- GET /download-template

## Security Features
1. Secure authentication system
2. Role-based access control
3. Data encryption
4. Input validation
5. Error handling
6. Session management
7. File upload validation

## Development Setup

### Frontend Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Backend Setup
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start all backends
python start_all_backends.py
```

### Individual Backend Start
```bash
# Start specific backend
python start_all_backends.py [backend_name]
# Example:
python start_all_backends.py exam_hall_backend
```

## File Structure
```
campus-connect/
├── src/                      # Frontend source code
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── styles/             # CSS styles
│   └── lib/                # Utilities
├── api/                     # Main API backend
├── auth/                    # Authentication backend
├── campus_chatbot/          # Chatbot service
├── course_backend/          # Course management
├── live_events_backend/     # Events tracking
├── study_materials_backend/ # Study materials
└── exam_hall_backend/       # Exam management
```

## Deployment Guidelines

### Requirements
- Node.js 16+
- Python 3.8+
- npm or yarn
- Virtual environment
- Required Python packages
- Required npm packages

### Environment Variables
- Database configurations
- API keys
- Service ports
- Authentication secrets
- File storage paths

### Server Configuration
- Port forwarding setup
- CORS configuration
- SSL/TLS setup
- Database connection
- File system permissions

## Maintenance and Updates

### Regular Maintenance Tasks
1. Database backup
2. Log rotation
3. Security updates
4. Performance monitoring
5. Error tracking

### Update Procedures
1. Code backup
2. Database backup
3. Pull latest changes
4. Update dependencies
5. Run migrations
6. Test system
7. Deploy updates

## Troubleshooting

### Common Issues
1. Port conflicts
2. Database connection errors
3. File permission issues
4. Memory usage problems
5. API timeout issues

### Debug Procedures
1. Check logs
2. Verify configurations
3. Test connections
4. Monitor resources
5. Validate data

## Future Enhancements
1. Mobile application
2. Real-time notifications
3. Advanced analytics
4. Integration with LMS
5. Enhanced AI capabilities
6. Improved user interface
7. Additional features based on feedback

## Contact and Support
- Repository: github.com/shrik4/majorproject
- License: MIT
- Support: [Project maintainer contact]
