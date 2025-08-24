import subprocess
import os

chatbot_path = os.path.join('campus_chatbot', 'app.py')

# Ensure the current working directory is the project root
os.chdir('d:\\Desktop\\major project ui\\campus-navigation-navigator')

print(f"Attempting to run: python {chatbot_path}")

try:
    process = subprocess.run(['python', chatbot_path], cwd='d:\\Desktop\\major project ui\\campus-navigation-navigator\\campus_chatbot', check=True, capture_output=True, text=True)
    print("STDOUT:")
    print(process.stdout)
    print("STDERR:")
    print(process.stderr)
except subprocess.CalledProcessError as e:
    print(f"Error running chatbot: {e}")
    print("STDOUT:")
    print(e.stdout)
    print("STDERR:")
    print(e.stderr)
except FileNotFoundError:
    print(f"Error: python executable not found. Make sure python is in your PATH or specify the full path.")