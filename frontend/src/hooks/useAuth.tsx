import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { TokenResponse, googleLogout, useGoogleLogin } from '@react-oauth/google';
// To decode ID token for user info

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  accessToken: string | null;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

interface UserProfile {
  email: string;
  name?: string;
  picture?: string;
  // Add other fields from ID token if needed
}

// Type guard for Google's TokenResponse to check for access_token
const hasAccessToken = (tokenResponse: any): tokenResponse is Omit<TokenResponse, 'error' | 'error_description' | 'error_uri'> => {
  return typeof tokenResponse.access_token === 'string';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Session timeout logic (e.g., 1 hour). Google access tokens are typically 1 hour.
  // This is a simple in-memory check. For production, you might need more robust session management.
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);

  const handleLogout = useCallback(() => {
    googleLogout();
    setUser(null);
    setAccessToken(null);
    setSessionExpiry(null);
    setError(null);
    // Clear any other stored auth state if necessary
    console.log("User logged out");
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (sessionExpiry) {
      const expiresIn = sessionExpiry - Date.now();
      if (expiresIn > 0) {
        timeoutId = setTimeout(() => {
          console.log("Session expired, logging out.");
          handleLogout();
        }, expiresIn);
      } else {
        // Already expired
        handleLogout();
      }
    }
    return () => clearTimeout(timeoutId);
  }, [sessionExpiry, handleLogout]);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError(null);
      console.log("Google Login Success:", tokenResponse);
      if (hasAccessToken(tokenResponse)) {
        setAccessToken(tokenResponse.access_token);
        setSessionExpiry(Date.now() + (tokenResponse.expires_in || 3600) * 1000); // Default to 1hr

        // Fetch user profile using ID token (if available) or access token
        // The @react-oauth/google library usually provides an ID token (`id_token`)
        // or you can use the access token to call Google's userinfo endpoint.
        // For PKCE, the id_token is standard.
        // If `tokenResponse.id_token` exists:
        // const idToken = tokenResponse.id_token; 
        // For this library, the user info might be part of the implicit flow or needs an extra call.
        // Let's assume we need to get it from a standard OIDC userinfo endpoint with the access_token
        // or decode an ID token if provided.
        
        // For MVP, if an ID token is implicitly included or separately fetched by `useGoogleLogin`,
        // it would be used here. The library handles PKCE.
        // If `tokenResponse` has `id_token` directly, use it:
        // const decodedIdToken: any = jwtDecode(tokenResponse.id_token);

        // Fallback: if not, call Google UserInfo endpoint
        try {
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          });
          if (!userInfoResponse.ok) {
            throw new Error(`Failed to fetch user info: ${userInfoResponse.statusText}`);
          }
          const userInfo = await userInfoResponse.json();
          setUser({
            email: userInfo.email,
            name: userInfo.name || userInfo.given_name,
            picture: userInfo.picture,
          });
          console.log("User profile fetched:", userInfo);
        } catch (err: any) {
          console.error("Failed to fetch user profile:", err);
          setError("Failed to fetch user profile after login.");
          // Don't necessarily log out, token might still be valid for API calls
          // but user info won't be displayed.
        }

      } else {
        console.error("Login response did not include access_token:", tokenResponse);
        setError("Login failed: No access token received.");
      }
      setIsLoading(false);
    },
    onError: (errorResponse) => {
      console.error("Google Login Error:", errorResponse);
      setError(errorResponse.error_description || errorResponse.error || 'Google login failed.');
      setIsLoading(false);
    },
    scope: 'email profile https://www.googleapis.com/auth/gmail.readonly', // Required scopes
    // flow: 'auth-code', // for PKCE with backend token exchange
    // The prompt asks for frontend PKCE. `useGoogleLogin` with `react-oauth/google` handles this.
    // The backend /scan endpoint will receive the access_token directly.
  });

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!accessToken && !!user, user, accessToken, login, logout: handleLogout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 