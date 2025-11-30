import subprocess
import os
import sys
import time

# Define the paths to each backend's main script
backend_paths = {
    "api": os.path.join("api", "run.py"),
    "live_events_backend": os.path.join("live_events_backend", "app.py"),
    "auth": os.path.join("auth", "app.py"),
    "course_backend": os.path.join("course_backend", "app.py"),
    "study_materials_backend": os.path.join("study_materials_backend", "app.py"),
    "exam_hall_backend": os.path.join("exam_hall_backend", "app.py"),
    "resume_backend": os.path.join("resume_backend", "server.py"),
    "job_search_backend": os.path.join("job_search_backend", "app.py"),
    "geolocation_backend": os.path.join("geolocation_backend", "app.py"),
    "ai_youtube_search_backend": os.path.join("ai_youtube_search_backend", "app.py"),
    "student_performance_backend": os.path.join("student_performance_backend", "app.py"),
    "notifications_backend": os.path.join("notifications_backend", "app.py"),
    "ai_study_buddy_backend": os.path.join("ai_study_buddy_backend", "app.py")
}

frontend_paths = {
    "csv_rag_backend": {"path": "csv_rag_backend", "command": [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--port", "8010"]}
}

processes = []

try:
    print("Starting all backend servers...")
    for name, script_path in backend_paths.items():
        full_script_path = os.path.join(os.path.dirname(__file__), script_path)
        if not os.path.exists(full_script_path):
            print(f"Error: {name} backend script not found at {full_script_path}")
            continue

        # Determine the working directory for the subprocess
        cwd = os.path.dirname(full_script_path)

        # Start each backend in its own process
        print(f"Starting {name} backend: python {script_path} from {cwd}")
        # Use sys.executable to ensure the correct python interpreter is used
        p = subprocess.Popen([sys.executable, full_script_path], cwd=cwd)
        processes.append(p)
        time.sleep(1) # Give a moment for each process to start

    print("Starting all frontend services...")
    for name, service_info in frontend_paths.items():
        service_path = service_info["path"]
        command = service_info["command"]
        full_service_path = os.path.join(os.path.dirname(__file__), service_path)

        if not os.path.exists(full_service_path):
            print(f"Error: {name} frontend service path not found at {full_service_path}")
            continue

        print(f"Starting {name} frontend: {' '.join(command)} from {full_service_path}")
        p = subprocess.Popen(command, cwd=full_service_path, shell=True)
        processes.append(p)
        time.sleep(1) # Give a moment for each process to start

    if not processes:
        print("No servers were started. Exiting.")
    else:
        print("All servers are running... Press Ctrl+C to stop.")
        # Keep the main script running until interrupted
        while True:
            time.sleep(1)

except KeyboardInterrupt:
    print("\nStopping all servers...")
    for p in processes:
        if p.poll() is None: # Check if process is still running
            p.terminate() # Send SIGTERM
            p.wait(timeout=5) # Wait for it to terminate
            if p.poll() is None:
                p.kill() # If still running, send SIGKILL
    print("All servers stopped.")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
finally:
    for p in processes:
        if p.poll() is None:
            p.kill() # Ensure all processes are killed on exit