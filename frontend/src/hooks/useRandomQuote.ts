import { useState, useCallback, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

interface RandomQuoteResponse {
  quote: string;
}

interface ApiErrorResponse {
    detail: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Set in .env or default

export const useRandomQuote = (fetchOnMount: boolean = true) => {
  const [quote, setQuote] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<RandomQuoteResponse>(`${API_BASE_URL}/quotes/random`);
      setQuote(response.data.quote);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      console.error("Random Quote API Error:", axiosError);
      if (axiosError.response) {
        setError(axiosError.response.data?.detail || `API error: ${axiosError.response.status}`);
      } else if (axiosError.request) {
        setError("Network error: Could not connect to quote server.");
      } else {
        setError(`Unexpected error: ${axiosError.message}`);
      }
      setQuote("Could not fetch a quote right now, but remember: you're awesome!"); // Fallback quote
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (fetchOnMount) {
      fetchQuote();
    }
  }, [fetchQuote, fetchOnMount]);

  return { quote, isLoading, error, fetchQuote };
}; 