import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider, createTheme, CssBaseline, useMediaQuery } from '@mui/material';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.error("FATAL: VITE_GOOGLE_CLIENT_ID is not defined in .env file. Please add it and restart the server.");
  // You could render an error message to the DOM here as well
}

const Main = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          // TODO: Customize theme further if needed (e.g., primary/secondary colors)
          // Example for Apple-style cards:
          // background: {
          //   paper: prefersDarkMode ? '#1e1e1e' : '#f9f9f9',
          // },
        },
        typography: {
          fontFamily: 'Roboto, Arial, sans-serif',
        },
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: '12px',
                        // boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Handled by global css or theme
                    }
                }
            }
        }
      }),
    [prefersDarkMode],
  );

  return (
    <React.StrictMode>
      {GOOGLE_CLIENT_ID ? (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <ThemeProvider theme={theme}>
            <CssBaseline /> {/* MUI's normalization and dark mode baseline */} 
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