# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container at /app
COPY . .

# Make port 8000 available to the world outside this container
# (or whichever port your app runs on)
EXPOSE 8000

# Define environment variable (if your app uses it to determine the port)
ENV PORT=8000

# Run main.py when the container launches
# Replace 'main:app' with the correct variable for your FastAPI app
# if main.py is in a subdirectory, adjust the path e.g. 'app.main:app'
# The host 0.0.0.0 is important to make it accessible from outside the container
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
