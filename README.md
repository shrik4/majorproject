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
- **`api`:** A Python backend that provides chatbot functionality.
- **`campus-navigation-backend`:** A Python backend that provides user authentication and other services.

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

### `api` Backend

1.  Navigate to the `api` directory:
    ```bash
    cd api
    ```
2.  Create a virtual environment:
    ```bash
    python -m venv college_bot_env
    ```
3.  Activate the virtual environment:
    -   **Windows:**
        ```bash
        .\college_bot_env\Scripts\activate
        ```
    -   **macOS/Linux:**
        ```bash
        source college_bot_env/bin/activate
        ```
4.  Install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5.  Run the Flask application:
    ```bash
    flask run
    ```

### `campus-navigation-backend`

1.  Navigate to the `campus-navigation-backend` directory:
    ```bash
    cd campus-navigation-backend
    ```
2.  Create a virtual environment:
    ```bash
    python -m venv venv
    ```
3.  Activate the virtual environment:
    -   **Windows:**
        ```bash
        .\venv\Scripts\activate
        ```
    -   **macOS/Linux:**
        ```bash
        source venv/bin/activate
        ```
4.  Install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5.  Run the Flask application:
    ```bash
    flask run
    ```