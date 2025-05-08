#!/bin/bash

# Function to cleanup background processes on exit
cleanup() {
    echo "Shutting down servers..."
    # Send SIGTERM to the process group of the script, then try specific PIDs if still running
    kill 0 # Kill all processes in the current process group (script and its children)
    # pkill -P $$ # Alternative: kill child processes of this script
    # kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait # Wait for background processes to terminate
    echo "Servers shut down."
    exit 0
}

# Set up trap to catch Ctrl+C (SIGINT) and SIGTERM
trap cleanup SIGINT SIGTERM EXIT

# Start backend server
echo "Starting backend server..."
# Ensure we are in the project root for this command
(cd "$(dirname "$0")" && cd backend && source venv/bin/activate && cd .. && uvicorn backend.main:app --reload --port 8000 --reload-dir backend) &
BACKEND_PID=$!

# Give backend a moment to start
sleep 3 # Increased sleep slightly

# Start frontend server
echo "Starting frontend server..."
(cd "$(dirname "$0")/frontend" && npm run dev) &
FRONTEND_PID=$!

echo "Both servers are running!"
echo "Backend (PID: $BACKEND_PID): http://localhost:8000"
echo "Frontend (PID: $FRONTEND_PID): http://localhost:5173 (default vite port)"
echo "Press Ctrl+C to stop both servers"

# Wait for both background processes to complete
# If either exits, the script will proceed (due to `wait -n` behavior or if one is killed)
# The trap will handle cleanup regardless.
wait $BACKEND_PID
wait $FRONTEND_PID

echo "All processes finished. This line might not be reached if using Ctrl+C." 