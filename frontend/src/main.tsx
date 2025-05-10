import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { initGoogleAnalytics } from './firebase/analytics';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
// Initialize Google Analytics with your measurement ID
initGoogleAnalytics('G-YW1V93FVGB');

if (!GOOGLE_CLIENT_ID) {
  console.error("FATAL: VITE_GOOGLE_CLIENT_ID is not defined in .env file. Please add it and restart the server.");
  // You could render an error message to the DOM here as well
}

const Main = () => {
  // Always use light mode regardless of system preferences
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          // Customize theme for light mode
          background: {
            paper: '#f9f9f9',
          },
        },
        typography: {
          fontFamily: 'Roboto, Arial, sans-serif',
        },
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: '12px',
                    }
                }
            }
        }
      }),
    [],
  );

  return (
    <React.StrictMode>
      {GOOGLE_CLIENT_ID ? (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ThemeProvider>
        </GoogleOAuthProvider>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red', fontSize: '1.2em' }}>
          Configuration error: <code>VITE_GOOGLE_CLIENT_ID</code> is missing. Please check your <code>.env</code> file.
        </div>
      )}
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Main />); 