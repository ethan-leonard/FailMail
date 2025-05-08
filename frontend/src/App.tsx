import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import DashboardPage from './pages/Dashboard';
import GoogleLoginButton from './components/GoogleLoginButton'; // For the login page
import { Container, Box, Typography, AppBar, Toolbar, CircularProgress, Avatar, Button } from '@mui/material';

// A component to guard routes that require authentication
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// AppContent will have access to AuthContext
function AppContent() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Rejection Dashboard
          </Typography>
          {isAuthenticated && user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {user.picture && <Avatar src={user.picture} alt={user.name || user.email} sx={{ width: 32, height: 32, mr: 1 }} />} 
              <Typography sx={{ mr: 2 }}>{user.name || user.email}</Typography>
              <Button color="inherit" onClick={logout} disabled={isLoading}>Logout</Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flexGrow: 1, py: 2 }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          {/* Redirect to login page by default if not authenticated, or dashboard if authenticated */}
          <Route 
            path="*" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
          />
        </Routes>
      </Container>
      <Box component="footer" sx={{ textAlign: 'center', py: 2, mt: 'auto', color: 'text.secondary' }}>
        <Typography variant="caption">
          &copy; {new Date().getFullYear()} Rejection Dashboard. No data stored, session only analysis.
        </Typography>
      </Box>
    </Box>
  );
}

export default App; 