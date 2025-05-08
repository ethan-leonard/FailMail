import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { useAuth } from './useAuth';

// Mirroring backend models for type safety
interface UserProfile {
    email: string;
    name?: string;
    picture?: string;
}
interface SnippetDetail {
    sender: string;
    snippet: string;
}
interface RejectionStats {
    total_rejections: number;
    rejections_per_month: { [key: string]: number };
    notable_rejections: SnippetDetail[];
    user_profile?: UserProfile; // This might be redundant if useAuth provides it
}

interface ScanResponse {
    stats: RejectionStats;
}

interface ApiErrorResponse {
    detail: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Set in .env or default

export const useGmailScan = () => {
  const { accessToken, logout } = useAuth(); // Get accessToken and logout from useAuth
  const [scanData, setScanData] = useState<RejectionStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const performScan = useCallback(async () => {
    if (!accessToken) {
      setError("Not authenticated. Please log in first.");
      // It might be better to rely on ProtectedRoute to prevent this call
      return;
    }

    setIsLoading(true);
    setError(null);
    setScanData(null); // Clear previous data

    try {
      // Use the VITE_API_BASE_URL for the endpoint
      const response = await axios.post<ScanResponse>(
        `${API_BASE_URL}/scan`, 
        { access_token: accessToken }, // Request body as per backend ScanRequest model
        {
          headers: {
            'Content-Type': 'application/json',
            // Authorization header might not be needed if token is in body, 
            // but good practice if other endpoints use Bearer token in header.
            // 'Authorization': `Bearer ${accessToken}` 
          },
        }
      );
      setScanData(response.data.stats);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>; // Type assertion
      console.error("Gmail Scan API Error:", axiosError);
      if (axiosError.response) {
        // Handle specific API error responses
        if (axiosError.response.status === 401) {
            setError("Authentication failed or token expired. Please log in again.");
            logout(); // Force logout if token is invalid
        } else {
            setError(axiosError.response.data?.detail || `An API error occurred: ${axiosError.response.status}`);
        }
      } else if (axiosError.request) {
        setError("Network error: Could not connect to the server. Is it running?");
      } else {
        setError(`An unexpected error occurred: ${axiosError.message}`);
      }
    }
    setIsLoading(false);
  }, [accessToken, logout]);

  return { scanData, isLoading, error, performScan, setScanData }; // Added setScanData for clearing if needed
}; 