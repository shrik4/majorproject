# Campus Navigation Navigator

This project is a campus navigation system with a chatbot and other features.

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

### Running a Single Backend

To run a specific backend, use the `start_all_backends.py` script with the backend name as an argument. For example:

```bash
python start_all_backends.py api
```