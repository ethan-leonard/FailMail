import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import DashboardPage from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import GoogleLoginButton from './components/GoogleLoginButton'; // For the login page
import { Container, Box, Typography, AppBar, Toolbar, CircularProgress, Avatar, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

// A component to guard routes that require authentication
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading authentication status...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If authenticated, render the child routes
  return <Outlet />;
};

// Simple Login Page Component
const LoginPage = () => {
  const { isAuthenticated, isLoading, error: authError, user } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  if (isAuthenticated && user) {
    return <Navigate to={from} replace />;
  }

  return (
    <Container maxWidth="xs">
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="calc(100vh - 64px - 4rem)" // Adjust for AppBar and padding
        textAlign="center"
      >
        <Typography variant="h4" gutterBottom component="h1">
          Rejection Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" paragraph>
          Sign in to scan your Gmail for job rejections and get some (hopefully) motivating stats!
        </Typography>
        <GoogleLoginButton />
        {isLoading && <CircularProgress sx={{ mt: 2 }} />}
        {authError && (
          <Typography color="error" sx={{ mt: 2 }}>
            Login failed: {authError}
          </Typography>
        )}
        <Typography variant="caption" display="block" sx={{ mt: 4, color: 'text.secondary' }}>
          This app will request read-only access to your Gmail to scan for rejection emails during this session only. No email data is stored on our servers.
        </Typography>
      </Box>
    </Container>
  );
};

// Theme for the entire app
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#111111',
    },
    secondary: {
      main: '#ffffff',
    },
    error: {
      main: '#FF4D4D', // Main accent color
    },
    warning: {
      main: '#F9CB28', // Secondary accent color
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    h1: {
      fontWeight: 800,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '12px',
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: '#111111',
          '&:hover': {
            backgroundColor: '#333333',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

function App() {
  // Apply the theme
  useEffect(() => {
    // Set meta theme color for mobile browsers
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", theme.palette.background.default);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

// AppContent will have access to AuthContext
function AppContent() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const location = useLocation();
  
  // Don't show AppBar on the landing page
  const isLandingPage = location.pathname === '/';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isLandingPage && (
        <AppBar 
          position="static" 
          sx={{ 
            mb: 2, 
            backgroundColor: 'background.paper', 
            color: 'text.primary',
            boxShadow: 'none',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Toolbar>
            <Typography 
              variant="h6" 
              component={Link}
              to="/"
              sx={{ 
                flexGrow: 1,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'text.primary'
              }}
            >
              <Box 
                component="span" 
                sx={{ 
                  color: 'error.main', 
                  fontWeight: 'bold',
                  mr: 0.5,
                }}
              >
                Fail
              </Box>
              Mail
            </Typography>
            {isAuthenticated && user && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {user.picture && <Avatar src={user.picture} alt={user.name || user.email} sx={{ width: 32, height: 32, mr: 1 }} />} 
                <Typography sx={{ mr: 2 }}>{user.name || user.email}</Typography>
                <Button 
                  variant="outlined" 
                  onClick={logout} 
                  disabled={isLoading}
                  sx={{ 
                    borderRadius: '20px',
                    px: 3,
                    fontWeight: 600
                  }}
                >
                  Logout
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>
      )}
      
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          {/* Removed the catch-all route to allow landing page access */}
        </Routes>
      </Box>
      
      {!isLandingPage && (
        <Box 
          component="footer" 
          sx={{ 
            textAlign: 'center', 
            py: 2, 
            mt: 'auto', 
            color: 'text.secondary',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="caption">
            &copy; {new Date().getFullYear()} FailMail. No data stored, session only analysis.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default App; 