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
    isTechCompany?: boolean; // Flag to identify tech company rejections
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

// List of major tech companies (FAANG, MAANG, etc.) for filtering notable rejections
const MAJOR_TECH_COMPANIES = [
  'Meta', 'Facebook', 'Apple', 'Amazon', 'Netflix', 'Google', 'Microsoft', 'Alphabet',
  'Adobe', 'Twitter', 'X Corp', 'Tesla', 'Nvidia', 'IBM', 'Intel', 'Oracle', 'Salesforce',
  'LinkedIn', 'Zoom', 'Uber', 'Lyft', 'Airbnb', 'Pinterest', 'Snap', 'Spotify',
  'Dropbox', 'Slack', 'Coinbase', 'Instacart', 'Robinhood', 'Square', 'Stripe',
  'Palantir', 'Snowflake', 'Databricks', 'GitHub', 'Atlassian', 'Workday', 'ServiceNow',
  'Adobe', 'VMware', 'Intuit', 'PayPal', 'eBay', 'DoorDash'
];

export const useGmailScan = () => {
  const { accessToken, logout } = useAuth(); // Get accessToken and logout from useAuth
  const [scanData, setScanData] = useState<RejectionStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to determine if a rejection is from a major tech company
  const isFromMajorTechCompany = useCallback((sender: string) => {
    return MAJOR_TECH_COMPANIES.some(company => 
      sender.toLowerCase().includes(company.toLowerCase())
    );
  }, []);

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
      
      // Process notable rejections to flag tech companies, but keep all of them
      let processedData = { ...response.data.stats };
      if (processedData.notable_rejections) {
        // Mark which rejections are from tech companies but keep all of them
        processedData.notable_rejections = processedData.notable_rejections.map(rejection => ({
          ...rejection,
          isTechCompany: isFromMajorTechCompany(rejection.sender)
        }));
      }
      
      setScanData(processedData);
      
      // Log the counts for debugging
      console.log("Total notable rejections:", processedData.notable_rejections?.length || 0);
      console.log("Tech company rejections:", 
        processedData.notable_rejections?.filter(r => r.isTechCompany).length || 0
      );
    } catch (err) {
      console.error("Error during scan:", err);
      
      // Handle axios errors
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        
        // Handle 401 Unauthorized by logging out
        if (axiosError.response?.status === 401) {
          setError("Authentication expired. Please log in again.");
          logout(); // Trigger logout and redirect to login
          return;
        }
        
        // Display server error message if available
        if (axiosError.response?.data?.detail) {
          setError(axiosError.response.data.detail);
        } else {
          setError(`Failed to scan: ${axiosError.message}`);
        }
      } else {
        // Handle non-axios errors
        setError(`An unexpected error occurred: ${(err as Error).message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, isLoading, scanData, logout, isFromMajorTechCompany]);

  return { scanData, isLoading, error, performScan, setScanData };
}; 