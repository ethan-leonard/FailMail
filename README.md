# FailMail - Rejection Dashboard MVP

This project is a Minimum Viable Product for the Rejection Dashboard, a web application that helps users track and analyze job rejection emails from their Gmail account, running within the FailMail monorepo.

## Features

*   **Google Sign-In**: Securely authenticate using your Google account (Gmail OAuth).
*   **Session-Only Scan**: Scans your inbox for job rejections *during the current session only*.
*   **Rejection Statistics**:
    *   Total number of rejections.
    *   Histogram of rejections per calendar month.
    *   List of "notable" rejections (e.g., FANG, template fails, interview stage).
*   **Privacy First**: **No raw email data is stored on any server.** Only derived statistics and short snippets are processed in memory.
*   **Interactive Dashboard**: View your stats on a React-based dashboard featuring:
    *   Summary card widgets.
    *   A Chart.js bar chart for monthly counts.
    *   A "Hall of Shame" for notable rejections.
    *   A random motivational quote.
*   **Shareable Stats**: Export a PNG of your dashboard or share it using the Web Share API.
*   **Responsive Design**: Mobile-friendly (minimum 360px width) and dark-mode aware.

## Tech Stack

*   **Backend**: Python 3.12, FastAPI, Uvicorn, Pydantic
*   **Frontend**: TypeScript, React 18, Vite, Material-UI (MUI)
*   **Authentication**: Google OAuth 2.0 (PKCE flow handled client-side)
*   **API Communication**: Async (FastAPI, aiohttp for Google API calls if needed by `google-api-python-client`)
*   **Charting**: Chart.js (via `react-chartjs-2`)

## Project Structure

```
FailMail/
  backend/                # FastAPI application
    main.py               # Main FastAPI app, defines endpoints
    auth.py               # Google OAuth related logic (token validation stub)
    gmail_scanner.py      # Logic for scanning Gmail and extracting stats
    models.py             # Pydantic models for data validation
    requirements.txt      # Python dependencies
  frontend/               # React (Vite + TypeScript) application
    src/
      components/         # Reusable UI components
      pages/              # Page components (e.g., Dashboard)
      hooks/              # Custom React hooks (e.g., useAuth, useGmailScan)
      App.tsx             # Main application component with routing
      main.tsx            # Entry point for the React app
      index.css           # Global styles, dark mode
      vite-env.d.ts       # Vite environment variable typings
    index.html            # Main HTML file for Vite
    package.json          # Node.js dependencies and scripts
    vite.config.ts        # Vite configuration
    tsconfig.json         # TypeScript configuration
    tsconfig.node.json    # TypeScript Node configuration (for Vite config)
  README.md               # This file
  start-app.sh          # Script to run both servers
```

## Setup and Running Locally

### 1. Prerequisites

*   Node.js (v18 or later recommended) and npm
*   Python 3.10 or later (3.12 specified in prompt) and pip
*   Google Cloud Platform Account

### 2. Google Cloud Console Setup

1.  **Create a new project** in the [Google Cloud Console](https://console.cloud.google.com/).
2.  **Enable the Gmail API**:
    *   Navigate to "APIs & Services" > "Library".
    *   Search for "Gmail API" and enable it.
3.  **Configure OAuth Consent Screen**:
    *   Navigate to "APIs & Services" > "OAuth consent screen".
    *   Choose "External" user type.
    *   Fill in the required app information (app name, user support email, developer contact).
    *   **Scopes**: Add the following scopes:
        *   `../auth/gmail.readonly` (View your email messages and settings)
        *   `../auth/userinfo.email` (View your email address)
        *   `../auth/userinfo.profile` (See your personal info, including any personal info you've made publicly available)
    *   **Test Users**: Add your Google account(s) to the list of test users. Since the app will be in "Testing" status, only these users can log in (max 100 users).
4.  **Create OAuth 2.0 Client ID**:
    *   Navigate to "APIs & Services" > "Credentials".
    *   Click "+ CREATE CREDENTIALS" > "OAuth client ID".
    *   Select "Web application" as the application type.
    *   Give it a name (e.g., "Rejection Dashboard Web Client").
    *   **Authorized JavaScript origins**: Add your frontend development URL. For Vite's default, this is `http://localhost:5173`.
    *   **Authorized redirect URIs**: Add the URI where Google will redirect after authentication. For `useGoogleLogin` from `@react-oauth/google` with PKCE, this is typically your app's base URL or a specific callback path handled by the client. For development: `http://localhost:5173` (the library handles the redirect path itself within this origin).
        *   *Note*: When deploying, add your production frontend URLs here.
    *   Click "Create". Copy the **Client ID**. You will need this for the frontend.

### 3. Environment Variables

Create a `.env` file in the `rejection-dashboard/frontend/` directory with your Google Client ID:

```env
# rejection-dashboard/frontend/.env

# Critical for frontend OAuth flow (obtained from Google Cloud Console)
VITE_GOOGLE_CLIENT_ID="YOUR_WEB_APPLICATION_CLIENT_ID_HERE"

# Base URL for the backend API (defaults to http://localhost:8000 in hooks if not set)
VITE_API_BASE_URL="http://localhost:8000"
```

*(Optional)* If you need to configure backend-specific Google credentials (e.g., if `auth.py` were to use a client secret for server-to-server validation, which is not the primary flow for this PKCE-based MVP), you would create a `.env` file in `rejection-dashboard/backend/`:

```env
# rejection-dashboard/backend/.env (Example, less critical for this PKCE MVP)

# GOOGLE_CLIENT_ID="YOUR_BACKEND_SPECIFIC_GOOGLE_CLIENT_ID_IF_ANY"
# GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET_IF_ANY"
```

### 4. Backend Setup

```bash
# Navigate to the backend directory (from FailMail/)
cd backend

# Create a virtual environment (recommended)
python -m venv venv # Or python3 -m venv venv

# Activate the virtual environment
# On Windows:
# venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies (while in backend/ and venv is active)
pip install -r requirements.txt

# IMPORTANT: Navigate back to the project root directory (FailMail/) to run the server
cd .. 

# Run the FastAPI development server from the PROJECT ROOT (FailMail/)
# Make sure your virtual environment (created in backend/venv) is active.
# If not, activate it from the root: source backend/venv/bin/activate
PYTHONPATH=backend uvicorn backend.main:app --port 8000 --reload
```

firebase deploy --only hosting

docker build -t my-failmail-backend .

docker tag my-failmail-backend us-west1-docker.pkg.dev/failmail/failmail-repo/failmail-backend:latest

docker push us-west1-docker.pkg.dev/failmail/failmail-repo/failmail-backend:latest    

The backend API will be available at `http://localhost:8000`.

### 5. Frontend Setup

```bash
# Navigate to the frontend directory (from FailMail/)
cd frontend

# Install dependencies
npm install

# Run the Vite development server
npm run dev
```

The frontend application will be available at `http://localhost:5173`.

### 6. Usage

1.  Open your browser and go to `http://localhost:5173`.
2.  Click "Sign in with Google" and authenticate with a Google account that you added as a test user in the Google Cloud Console.
3.  Once logged in, the dashboard will appear.
4.  Click "Scan My Gmail for Rejections" (or similar button) to initiate the scan.
5.  View your rejection statistics!

## Privacy Statement

This application prioritizes your privacy:

*   **No Data Storage**: The Rejection Dashboard **does not store any of your raw email content or personal data** on any server or database. All processing of email headers and snippets to derive statistics happens in memory during your active session.
*   **Session-Limited Tokens**: OAuth tokens granted to this application are intended for use only during the current session. The application is designed to work without persistent storage of tokens.
*   **Read-Only Access**: The application requests `gmail.readonly` permission, meaning it can only read email metadata and content. It cannot send, delete, or modify any emails or your Gmail settings.
*   **Limited Scope**: Access is requested only for Gmail, email, and profile scopes necessary for the application's functionality.

## Known Limitations (MVP)

*   **100 Test Users**: As the Google OAuth client is in "Testing" status (to avoid the lengthy verification process for an MVP), only up to 100 registered test users can use the application.
*   **Basic Rejection Keywords**: The initial set of keywords for identifying rejection emails is basic and may not catch all rejections or might have false positives. This can be expanded.
*   **Error Handling**: While basic error handling is in place, it can be made more robust.
*   **Token Refresh**: The current MVP relies on the initial access token being valid for the session. Full refresh token handling on the backend (if the frontend were to send an auth code) is not implemented to keep the client-side PKCE simple for the MVP.
*   **Gmail API Quotas**: Heavy or frequent use by many users could potentially hit Gmail API quota limits. This is unlikely for an MVP with limited users.
*   **Date Range for Scan**: The Gmail query for scanning emails currently uses a fixed `after:2024/01/01` date. This could be made configurable.

## TODOs / Future Enhancements

*   More sophisticated rejection detection (NLP, machine learning).
*   User-configurable scan parameters (date range, custom keywords).
*   More detailed analytics and visualizations.
*   Allow users to manually tag or correct identified rejections.
*   Full Google OAuth verification to remove the 100-user limit.
*   More robust server-side token validation and refresh mechanisms if needed.
*   Expand lists for FANG domains, template fail regex, and interview keywords.
*   Implement the actual Google userinfo call in `backend/auth.py` instead of the stub.
*   Refine UI/UX details (e.g., loading states, empty states, theme customization).
