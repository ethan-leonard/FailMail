from typing import List, Dict, Optional
from pydantic import BaseModel, EmailStr, HttpUrl

class TokenData(BaseModel):
    access_token: str
    # We might also get refresh_token, id_token, scope, expires_in
    # For simplicity, focusing on access_token for Gmail API calls.
    # PKCE flow might provide id_token for user info.

class UserProfile(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    picture: Optional[HttpUrl] = None

class SnippetDetail(BaseModel):
    sender: str
    snippet: str # 100-char snippet

class RejectionStats(BaseModel):
    total_rejections: int
    rejections_per_month: Dict[str, int] # e.g., {"2024-01": 5, "2024-02": 3}
    notable_rejections: List[SnippetDetail]
    user_profile: Optional[UserProfile] = None # To display who is logged in

class ScanRequest(BaseModel):
    # The frontend will send the authorization code from Google's PKCE flow
    # The backend will exchange it for tokens.
    # Or, if tokens are managed client-side and passed directly (less secure for access_token):
    # For an MVP where frontend handles PKCE and gets an access_token for Gmail API:
    access_token: str # Temporary access token obtained by client-side OAuth

class ScanResponse(BaseModel):
    stats: RejectionStats
    # motivational_quote: str # This will be a separate endpoint

class ErrorResponse(BaseModel):
    detail: str

class RandomQuoteResponse(BaseModel):
    quote: str 