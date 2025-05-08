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

const API_BASE_URL_FROM_ENV = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = API_BASE_URL_FROM_ENV || 'http://localhost:8000'; // Set in .env or default

export const useGmailScan = () => {
  const { accessToken, logout } = useAuth(); // Get accessToken and logout from useAuth
  const [scanData, setScanData] = useState<RejectionStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const performScan = useCallback(async () => {
    // Add a log here to see when this function is called
    console.log("--- performScan called ---", { accessTokenPresent: !!accessToken, isLoading, scanDataExists: !!scanData });

    if (!accessToken) {
      setError("Not authenticated. Please log in first.");
      // It might be better to rely on ProtectedRoute to prevent this call
      return;
    }

    setIsLoading(true);
    setError(null);
    setScanData(null); // Clear previous data

    // Log the values to debug
    console.log("VITE_API_BASE_URL from import.meta.env:", API_BASE_URL_FROM_ENV);
    console.log("Effective API_BASE_URL for request:", API_BASE_URL);
    console.log("Constructed URL for /scan:", `${API_BASE_URL}/scan`);

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
      // ... existing code ...
    }
  }, [accessToken]);

  return { scanData, isLoading, error, performScan };
}; 