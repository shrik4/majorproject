@echo off
echo Starting Backend and Frontend Servers...
echo.

REM Start backend servers in a new window
start "Backend Servers" cmd /k "cd /d "%~dp0" && .venv\Scripts\activate && python start_all_backends.py"

REM Wait a moment before starting frontend
timeout /t 2 /nobreak >nul

REM Start frontend server in a new window
start "Frontend Server" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo Both servers are starting in separate windows...
echo Backend: Check the "Backend Servers" window
echo Frontend: Check the "Frontend Server" window
echo.
pause
