from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
import random
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(dotenv_path='../.env.example') # For dev, points to root .env.example or .env

from .models import ScanRequest, ScanResponse, ErrorResponse, RandomQuoteResponse, UserProfile
from .gmail_scanner import scan_gmail_for_rejections
from .auth import get_user_profile_from_token # Assuming frontend sends access_token

# --- Application Setup ---
app = FastAPI(
    title="Rejection Dashboard API",
    description="API for scanning Gmail for job rejections and displaying stats.",
    version="0.1.0"
)

# --- CORS Configuration ---
# TODO: Restrict origins in production
origins = [
    "http://localhost:5173", # Default Vite dev server
    "http://localhost:3000", # Common React dev server
    # Add your frontend deployment URL here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Motivational Quotes ---
MOTIVATIONAL_QUOTES = [
    "The first step toward success is taken when you refuse to be a captive of the environment in which you first find yourself. - Mark Caine",
    "Our greatest glory is not in never failing, but in rising up every time we fail. - Ralph Waldo Emerson",
    "It is impossible to live without failing at something, unless you live so cautiously that you might as well not have lived at all - in which case, you fail by default. - J.K. Rowling",
    "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
    "I have not failed. I've just found 10,000 ways that won't work. - Thomas A. Edison",
    "You build on failure. You use it as a stepping stone. Close the door on the past. You don't try to forget the mistakes, but you don't dwell on it. You don't let it have any of your energy, or any of your time, or any of your space. - Johnny Cash",
    "It's fine to celebrate success but it is more important to heed the lessons of failure. - Bill Gates",
    "Rejection is merely a redirection; a course correction to your destiny. - Bryant McGill",
    "Every rejection is a gift. A chance to learn, a chance to grow, a chance to try again. Keep going!",
    "This is proof you're trying. Keep at it!"
    # TODO: Add more quotes
]

# --- API Endpoints ---

@app.post("/scan",
            response_model=ScanResponse,
            responses={
                400: {"model": ErrorResponse, "description": "Bad Request"},
                401: {"model": ErrorResponse, "description": "Unauthorized - Invalid Token"},
                500: {"model": ErrorResponse, "description": "Internal Server Error"}
            },
            summary="Scan Gmail for Rejections",
            description="Receives an OAuth access token, scans the user's Gmail for job rejection emails within the current session, and returns aggregated statistics."
            )
async def scan_rejections(scan_request: ScanRequest = Body(...)):
    """
    Handles the Gmail scanning process.
    - Receives `access_token` from the frontend (obtained via PKCE).
    - Validates token and fetches user profile (stubbed in auth.py for now).
    - Scans Gmail for rejections.
    - Returns statistics.
    """
    try:
        # 1. Get user profile using the access token
        # This step would also implicitly validate the token if it calls a Google endpoint.
        # For now, auth.get_user_profile_from_token is a stub.
        user_profile: UserProfile = await get_user_profile_from_token(scan_request.access_token)
        
        if not user_profile or not user_profile.email:
             raise HTTPException(status_code=401, detail="Could not retrieve user profile from token.")

        # 2. Scan Gmail for rejections
        rejection_stats = await scan_gmail_for_rejections(
            access_token=scan_request.access_token,
            user_profile=user_profile
        )
        return ScanResponse(stats=rejection_stats)

    except HTTPException as http_exc:
        # Re-raise HTTPException to let FastAPI handle it
        raise http_exc
    except Exception as e:
        # Log the exception details in a real application
        # import traceback
        # traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@app.get("/quotes/random", 
           response_model=RandomQuoteResponse,
           summary="Get a Random Motivational Quote",
           description="Returns a randomly selected motivational quote."
           )
async def get_random_quote():
    """
    Provides a random motivational quote from a predefined list.
    """
    if not MOTIVATIONAL_QUOTES:
        return RandomQuoteResponse(quote="No quotes available at the moment. But you're doing great!")
    return RandomQuoteResponse(quote=random.choice(MOTIVATIONAL_QUOTES))

# --- Root Endpoint for Health Check (Optional) ---
@app.get("/", summary="Health Check", description="Basic health check endpoint.")
async def root():
    """
    A simple health check endpoint.
    """
    return {"message": "Rejection Dashboard API is running!"}

# --- Uvicorn specific (for running directly with `python backend/main.py`) ---
# if __name__ == "__main__":
#     import uvicorn
#     # This is for development only. For production, use a process manager like Gunicorn with Uvicorn workers.
#     # uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
#     # The prompt specifies: uvicorn backend.main:app --reload
#     # So, this __main__ block is not strictly necessary if following that command.
#     pass 