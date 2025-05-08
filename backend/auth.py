from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer # Example, might not be directly used if token comes in body
from pydantic import EmailStr
import os
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as GoogleAuthRequest
from google_auth_oauthlib.flow import Flow
from typing import Optional, Dict, Any

from .models import UserProfile

# These would be loaded from .env or environment variables
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
# Redirect URI for server-side flow if we were doing that here.
# For PKCE, the redirect URI is handled by the client.
# REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI_BACKEND") 

# Scopes required by the application
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"]

# This is a simplified representation. In a full server-side PKCE exchange,
# this module would handle the token exchange with Google.
# Given the prompt, frontend handles PKCE and sends access_token.
# This function primarily validates the token and extracts user info.

async def get_user_profile_from_token(access_token: str) -> UserProfile:
    """ 
    Validates an access token (e.g., by calling Google's tokeninfo or userinfo endpoint)
    and retrieves basic user profile information.
    """
    # In a real scenario, you would use the access_token to call
    # Google's userinfo endpoint: `https://www.googleapis.com/oauth2/v3/userinfo`
    # or tokeninfo: `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=TOKEN`
    # For this MVP, we'll assume the token is valid and mock user info retrieval.
    # This part needs a real implementation using aiohttp to call Google's endpoint.

    # Placeholder for actual Google API call
    # Example using aiohttp (ensure aiohttp is in requirements.txt)
    # import aiohttp
    # async with aiohttp.ClientSession() as session:
    #     async with session.get(f"https://www.googleapis.com/oauth2/v3/userinfo",
    #                            headers={"Authorization": f"Bearer {access_token}"}) as resp:
    #         if resp.status == 200:
    #             user_data = await resp.json()
    #             return UserProfile(
    #                 email=user_data.get("email"),
    #                 name=user_data.get("name"),
    #                 picture=user_data.get("picture")
    #             )
    #         else:
    #             # Log error: await resp.text()
    #             raise HTTPException(
    #                 status_code=status.HTTP_401_UNAUTHORIZED,
    #                 detail="Invalid access token or unable to fetch user info.",
    #             )
    
    # TODO: Implement actual Google userinfo call
    print(f"[AUTH_STUB] Pretending to validate token: {access_token[:20]}...")
    # This is a stub. Replace with actual API call to Google to get user info.
    # If the frontend has already fetched this via its ID token, it could pass it.
    # For now, we'll return a dummy profile based on a placeholder.
    return UserProfile(email="user@example.com", name="Test User", picture="https://example.com/avatar.jpg")

# If we were to implement server-side OAuth token exchange (e.g. for auth code from frontend):
# async def exchange_auth_code_for_tokens(auth_code: str, redirect_uri_frontend: str) -> Dict[str, Any]:
#     flow = Flow.from_client_secrets_file(
#         'client_secret.json', # You'd need to securely load this
#         scopes=SCOPES,
#         redirect_uri=redirect_uri_frontend # Crucial: must match what client used
#     )
#     try:
#         flow.fetch_token(code=auth_code)
#         credentials = flow.credentials
#         return {
#             "access_token": credentials.token,
#             "refresh_token": credentials.refresh_token,
#             "id_token": credentials.id_token,
#             "scopes": credentials.scopes,
#             "expires_at": credentials.expiry.isoformat() if credentials.expiry else None
#         }
#     except Exception as e:
#         # Log e
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=f"Failed to exchange authorization code: {str(e)}"
#         )

# Placeholder for token refresh logic if needed (not strictly for this MVP's constraints)
async def refresh_access_token(refresh_token: str) -> Optional[str]:
    """
    Refreshes an access token using a refresh token.
    Returns the new access token or None if refresh fails.
    This is important for long-lived sessions but the MVP is session-only.
    """
    # TODO: Implement token refresh logic if storing refresh tokens
    # (which the current MVP constraints avoid by being session-only and no server persistence)
    return None 