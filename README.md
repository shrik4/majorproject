# Campus Connect

A comprehensive campus management system featuring an AI chatbot, study materials management, course information, and live events tracking.

## Features

- **AI Chatbot**: Interactive campus assistant for student queries
- **Study Materials**: Organized file management system for academic resources
- **Course Information**: Detailed course listings and information
- **Live Events**: Real-time campus event tracking
- **User Authentication**: Secure login system with admin privileges
- **Admin Dashboard**: Comprehensive management interface for content

## Technologies Used

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Flask
- Python

## Project Structure

The project is divided into three main parts:

- **Frontend:** The user interface of the application, built with React.
- **`api`:** A Python backend for general API services.
- **`auth`:** A Python backend for user authentication.
- **`backend`:** A Python backend for core application services.
- **`campus_chatbot`:** A Python backend that provides chatbot functionality.
- **`course_backend`:** A Python backend for course-related services.
- **`live_events_backend`:** A Python backend for live events services.
- **`exam_hall_backend`:** A Python backend for exam hall management.

## Setup Instructions

### Frontend

1.  Navigate to the root directory of the project.
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

### Running the Backends

1. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On Linux/Mac:
   source .venv/bin/activate
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start all backends at once:
   ```bash
   python start_all_backends.py
   ```

   Or run a specific backend:
   ```bash
   python start_all_backends.py api
   python start_all_backends.py exam_hall_backend
   ```

## Development Guide

### Updating from GitHub

If you've cloned this repository and want to get the latest updates:

1. Fetch and pull the latest changes:
   ```bash
   git fetch origin
   git pull origin main
   ```

2. Update dependencies:
   ```bash
   # Update Python packages
   pip install -r requirements.txt
   
   # Update npm packages
   npm install
   ```

### Port Configuration

The project runs multiple services on different ports:
- Frontend (Vite): 5173
- API Backend: 5000
- Auth Backend: 5001
- Campus Chatbot: 5002
- Course Backend: 5003
- Live Events Backend: 5004
- Study Materials Backend: 5005
- Exam Hall Backend: 5006

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.