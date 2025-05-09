import asyncio
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime
import re
import base64
from email import message_from_bytes
import time # Import time for potential backoff

from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from fastapi import HTTPException

from models import RejectionStats, SnippetDetail, UserProfile

# --- Constants for Rejection Identification ---

# Keywords suggesting rejection (Expanded List)
REJECTION_KEYWORDS = [
    # Core Phrases
    "regret to inform", "unfortunately", "not proceed", "other candidates",
    "application will not be progressed", "decided to move forward with",
    "won\'t be moving forward", "thank you for your interest", "position has been filled",
    "not selected for this role", "unable to offer you a position",
    "appreciate you applying", "pursuing other applicants", "alternative candidates",
    "filled the position", "not moving forward", "selected another candidate",
    "different direction", "qualifications more closely match", "will not be extending an offer",
    "no longer considering your application", "after careful consideration", 
    "highly competitive", "volume of applications", "wish you success",
    "best of luck", "encourage you to apply for future openings",
    
    # Potential Interview Stage Rejections (also used in is_rejection)
    "thank you for taking the time", "enjoyed our conversation", 
    "following your interview", "after your recent interview", "interview process" 
    # TODO: Continue refining this list based on common rejection emails
]

# Domains for FANG and notable companies (Keep as is for now, can be expanded later)
FANG_DOMAINS = [
    "google", "amazon", "apple", "meta", "facebook", "microsoft"
]

# Specific job domains that should be recognized as FANG
FANG_JOB_DOMAINS = [
    "mail.amazon.jobs"
]

# Regex for template fails
TEMPLATE_FAIL_REGEX = r"({[^}]*}|<INSERT NAME[^>]*>|\[COMPANY NAME\])" # Added common placeholder

# Keywords suggesting an interview stage rejection (More focused list for tagging)
INTERVIEW_KEYWORDS = [
    "thank you for taking the time to interview", "enjoyed our conversation about your experience",
    "following your interview", "after your recent interview", "interview process"
]

# --- Gmail API query string (Expanded and Refined)
# Use more ORs, broader phrases, and potentially category exclusions if useful (e.g., -category:promotions)
# Using "subject:()" can also help target emails about applications.
# Example: subject:(Your application OR Update on your application OR Regarding your application)
# Let's make the keyword part broader:
GMAIL_QUERY_KEYWORDS = ' OR '.join([f'"{phrase}"' for phrase in [
    "regret to inform", "unfortunately", "will not be proceeding", 
    "move forward with other", "application will not be progressed", 
    "thank you for your interest", "position has been filled",
    "not selected for this role", "unable to offer", 
    "pursuing other applicants", "after careful consideration",
    "wish you success", "status of your application" # Added a status update phrase which might lead to rejection email
]])

# --- Build the Gmail Query ---
# Start with keywords
query_parts = [f'({GMAIL_QUERY_KEYWORDS})']

# Optional: Add subject filter
# query_parts.append('subject:("application" OR "position" OR "role")')

# Optional: Exclude categories
# query_parts.append('-category:(promotions OR social OR forums)')

# Add date filter
query_parts.append('after:2024/01/01') # TODO: Make dynamic

# Join parts with AND (Gmail uses space for AND implicitly)
BASE_GMAIL_QUERY = ' '.join(query_parts)

print(f"Using Gmail Query: {BASE_GMAIL_QUERY}")

# --- Email Processing Functions ---

def _decode_email_body(parts: List[Dict[str, Any]]) -> str:
    """Helper to decode email body parts."""
    plain_text = ""
    html_content = ""
    
    if parts:
        for part in parts:
            mime_type = part.get('mimeType', '').lower()
            if mime_type == 'text/plain':
                data = part['body'].get('data')
                if data:
                    try:
                        plain_text += base64.urlsafe_b64decode(data).decode('utf-8', errors='replace')
                    except Exception:
                        pass # Ignore decoding errors for specific parts
            elif mime_type == 'text/html':
                data = part['body'].get('data')
                if data:
                    try:
                        html_content += base64.urlsafe_b64decode(data).decode('utf-8', errors='replace')
                    except Exception:
                        pass # Ignore decoding errors
            elif 'parts' in part:
                # Recursive call for nested parts
                nested_result = _decode_email_body(part['parts'])
                if nested_result:
                    # If the nested result contains plain text, add it
                    plain_text += nested_result
    
    # Always prioritize plain text over HTML
    if plain_text:
        body = plain_text
    elif html_content:
        # Only use HTML if no plain text is available, and strip all HTML tags
        body = re.sub('<style.*?</style>', '', html_content, flags=re.DOTALL | re.IGNORECASE) # Remove style blocks
        body = re.sub('<[^>]+?>', ' ', body) # Replace tags with space
        body = re.sub(r'\s+', ' ', body).strip() # Consolidate whitespace
    else:
        body = ""
    
    # Replace non-breaking spaces and normalize line endings
    return body.replace('\xa0', ' ').replace('\r\n', ' \n').replace('\r', ' \n')

async def get_email_details(service, message_id: str) -> tuple[str | None, str | None, datetime | None]:
    """Fetches sender, subject, plain text body, and date for a single email."""
    try:
        # Use run_in_executor for blocking I/O call with asyncio
        loop = asyncio.get_running_loop()
        message_data = await loop.run_in_executor(
            None, 
            lambda: service.users().messages().get(userId='me', id=message_id, format='full').execute()
        )

        payload = message_data.get('payload', {})
        headers = payload.get('headers', [])
        
        sender, subject, date_str = None, None, None
        sender_email = None # Store just the email address
        for header in headers:
            name = header.get('name', '').lower()
            if name == 'from':
                sender = header.get('value')
                # Extract email address more reliably
                match = re.search(r'[\w\.\+\-]+@[\w\.\-]+\.[a-zA-Z]+', sender)
                if match:
                    sender_email = match.group(0)
                elif '<' in sender and '>' in sender: # Fallback for "Name <email>"
                    sender_email = sender.split('<')[-1].split('>')[0].strip()
                else: # If only email is present
                    sender_email = sender.strip()
            elif name == 'subject':
                subject = header.get('value')
            elif name == 'date':
                date_str = header.get('value')
        
        email_date = None
        if date_str:
            # Attempt more robust date parsing
            try:
                # Remove timezone name if present (e.g., "(PST)") as strptime struggles with it
                date_str_cleaned = re.sub(r'\s*\(.*\)\s*$', '', date_str).strip()
                # Common formats
                common_formats = ['%a, %d %b %Y %H:%M:%S %z', '%d %b %Y %H:%M:%S %z', 
                                  '%a, %d %b %Y %H:%M:%S', '%Y-%m-%dT%H:%M:%S%z']
                for fmt in common_formats:
                    try:
                        email_date = datetime.strptime(date_str_cleaned, fmt)
                        break # Success
                    except ValueError:
                        continue # Try next format
            except Exception as date_e:
                print(f"Warning: Could not parse date string '{date_str}': {date_e}")
                pass # Log failure or use a default? For now, leave as None

        body_content = ""
        if 'parts' in payload:
            body_content = _decode_email_body(payload['parts'])
        elif payload.get('body') and payload['body'].get('data'):
            try:
                data = payload['body'].get('data')
                body_content = base64.urlsafe_b64decode(data).decode('utf-8', errors='replace')
                # If this is HTML content, strip tags
                if payload.get('mimeType', '').lower() == 'text/html':
                    body_content = re.sub('<style.*?</style>', '', body_content, flags=re.DOTALL | re.IGNORECASE)
                    body_content = re.sub('<[^>]+?>', ' ', body_content)
                    body_content = re.sub(r'\s+', ' ', body_content).strip()
            except Exception: 
                pass # Ignore decoding errors
        
        # Fallback to snippet if body parsing is difficult/empty
        if not body_content and message_data.get('snippet'):
            body_content = message_data.get('snippet', '')
            
        # Return the extracted email address for sender filtering
        return sender_email, body_content, email_date 
    except Exception as e:
        # Log specific error during detail fetching
        print(f"Error fetching details for email {message_id}: {type(e).__name__} - {e}") 
        return None, None, None # Return None for all fields on error

def is_rejection(email_body: str, sender_email: Optional[str]) -> Tuple[bool, List[str]]:
    """ 
    Determines if an email is a rejection and identifies notable characteristics.
    Returns a tuple: (is_rejection_flag, list_of_tags_for_notability).
    """
    if not email_body:
        return False, []

    lower_body = email_body.lower()
    # Check against the expanded keyword list
    rejection_found = any(keyword.lower() in lower_body for keyword in REJECTION_KEYWORDS)
    if not rejection_found:
        return False, []

    tags = []
    # Check FANG (Ensure sender_email is not None)
    if sender_email:
        # Check for standard domain patterns
        is_fang = any(domain in sender_email.lower() or f"{domain}.com" in sender_email.lower() 
                     for domain in FANG_DOMAINS)
        
        # Also check specific job-related domains
        if not is_fang:
            is_fang = any(domain in sender_email.lower() for domain in FANG_JOB_DOMAINS)
            
        if is_fang:
            tags.append("FANG")
        
    # Check template fails (use original body for case-sensitive placeholders if needed, else lower_body)
    if re.search(TEMPLATE_FAIL_REGEX, email_body): # Check original case body
        tags.append("TemplateFail")
        
    # Check interview stage keywords
    if any(keyword.lower() in lower_body for keyword in INTERVIEW_KEYWORDS):
        tags.append("InterviewStage")
    
    return True, tags

async def scan_gmail_for_rejections(access_token: str, user_profile: UserProfile) -> RejectionStats:
    """
    Scans Gmail for rejection emails using the provided OAuth2 token.
    Aggregates statistics about rejections. Implements pagination.
    """
    creds = Credentials(token=access_token)
    if not creds.valid:
        if creds.expired and creds.refresh_token:
            pass
        else:
            raise HTTPException(status_code=401, detail="Invalid or expired credentials. Please re-authenticate.")

    try:
        loop = asyncio.get_running_loop()
        service = await loop.run_in_executor(None, lambda: build('gmail', 'v1', credentials=creds))
        
        all_messages = []
        page_token = None
        max_pages = 10 # Limit pagination to avoid excessive API calls
        pages_fetched = 0

        print("Starting Gmail message list fetch with pagination...")
        while pages_fetched < max_pages:
            pages_fetched += 1
            print(f"Fetching page {pages_fetched}...")
            try:
                response = await loop.run_in_executor(
                    None, 
                    lambda: service.users().messages().list(
                        userId='me', 
                        q=BASE_GMAIL_QUERY, 
                        maxResults=500,
                        pageToken=page_token
                    ).execute()
                )
                messages_on_page = response.get('messages', [])
                all_messages.extend(messages_on_page)
                print(f"  Found {len(messages_on_page)} messages on page {pages_fetched}. Total so far: {len(all_messages)}")

                page_token = response.get('nextPageToken')
                if not page_token:
                    print("  No more pages found.")
                    break
                else:
                     print(f"  Found nextPageToken, continuing...")
            except Exception as list_exc:
                 print(f"Error during messages.list API call on page {pages_fetched}: {list_exc}")
                 raise HTTPException(status_code=500, detail=f"Failed during Gmail search pagination: {str(list_exc)}") from list_exc
        
        print(f"Finished fetching message list. Total messages to process: {len(all_messages)}")
        
        # --- Process Messages ---
        semaphore = asyncio.Semaphore(1)
        processed_count = 0
        
        # Collection of ALL rejection emails with their details
        all_rejection_emails = []
        
        async def process_message(msg_summary):
            nonlocal processed_count
            async with semaphore:
                msg_id = msg_summary['id']
                sender_email, body, email_date = await get_email_details(service, msg_id)
                processed_count += 1
                
                if processed_count % 50 == 0:
                    print(f"  Processed {processed_count}/{len(all_messages)} emails...")

                # Skip if missing critical data
                if not body or not email_date:
                    return None
                
                # Check if this is a rejection email
                is_reject, tags = is_rejection(body, sender_email)
                if is_reject:
                    # Extract the month-year for aggregation
                    month_year_key = email_date.strftime("%Y-%m")
                    
                    # Create a snippet for display purposes
                    snippet_text = (body[:97].strip() + '...') if len(body) > 100 else body.strip()
                    
                    # Use a placeholder if sender couldn't be extracted
                    display_sender = sender_email if sender_email else "Unknown Sender"
                    
                    # Return the full data about this rejection email
                    return {
                        "month_year": month_year_key,
                        "sender": display_sender,
                        "snippet": snippet_text,
                        "tags": tags,
                        "date": email_date
                    }
            return None  # Not a rejection email or missing data

        print(f"Starting processing of {len(all_messages)} messages...")
        start_time = time.time()
        
        # Create tasks for all messages
        tasks = [process_message(msg) for msg in all_messages]
        results = await asyncio.gather(*tasks)
        
        # Filter out None results (non-rejections or errors)
        all_rejection_emails = [result for result in results if result]
        
        end_time = time.time()
        print(f"Finished processing messages in {end_time - start_time:.2f} seconds.")

        # --- Simple Aggregation of Results ---
        # 1. Total count of rejections
        total_rejections = len(all_rejection_emails)
        
        # 2. Count by month - initialize with 0 for all keys to ensure all months are represented
        rejections_per_month = {}
        for rejection in all_rejection_emails:
            month_key = rejection["month_year"]
            rejections_per_month[month_key] = rejections_per_month.get(month_key, 0) + 1
        
        # 3. Count FANG rejections
        fang_rejection_count = sum(1 for r in all_rejection_emails if "FANG" in r["tags"])
        
        # 4. Get examples for display (up to 5, prioritizing FANG, then Interview rejections)
        # Sort by FANG > InterviewStage > TemplateFail > Others
        def get_display_priority(rejection):
            if "FANG" in rejection["tags"]:
                return 0
            elif "InterviewStage" in rejection["tags"]:
                return 1  
            elif "TemplateFail" in rejection["tags"]:
                return 2
            return 3
        
        # Sort and take top 5 for display
        sorted_for_display = sorted(all_rejection_emails, key=get_display_priority)
        display_rejections = [
            SnippetDetail(sender=r["sender"], snippet=r["snippet"]) 
            for r in sorted_for_display[:5]  # Take top 5 for display snippets
        ]
        
        # Log the counts for verification
        print(f"Scan complete.")
        print(f"Total rejections found: {total_rejections}")
        print(f"Rejections by month: {rejections_per_month}")
        print(f"FANG company rejections: {fang_rejection_count}")
        print(f"Sum of monthly totals: {sum(rejections_per_month.values())} (should equal {total_rejections})")
        
        # Return the stats
        return RejectionStats(
            total_rejections=total_rejections,
            rejections_per_month=dict(sorted(rejections_per_month.items())),  # Sort by month
            fang_rejection_count=fang_rejection_count,
            notable_rejections=display_rejections,
            user_profile=user_profile
        )

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        import traceback
        print(f"An unexpected error occurred during Gmail scan: {type(e).__name__} - {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Unexpected error during Gmail scan: {str(e)}")

# TODO: Utility functions for keyword list, FANG domain list, template-fail regex are defined as constants above.
# They could be moved to a separate utils.py if they grow significantly or need dynamic loading. 