import subprocess
import os
import sys
import time

# Define the paths to each backend's main script
backend_paths = {
    "api": os.path.join("api", "run.py"),
    "campus_chatbot": os.path.join("campus_chatbot", "app.py"),
    "live_events_backend": os.path.join("live_events_backend", "app.py"),
    "auth": os.path.join("auth", "app.py"),
    "course_backend": os.path.join("course_backend", "app.py"),
    "study_materials_backend": os.path.join("study_materials_backend", "app.py")
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

    if not processes:
        print("No backend servers were started. Exiting.")
    else:
        print("All backend servers are running... Press Ctrl+C to stop.")
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