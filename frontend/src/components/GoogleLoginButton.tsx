import { useAuth } from '../hooks/useAuth';
import { Button, CircularProgress, Box } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const GoogleLoginButton = () => {
  const { login, isLoading, error, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null; // Don't show login button if already authenticated
  }

  const handleLoginClick = () => {
    if (!isLoading) {
      login();
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Button
        variant="contained"
        color="primary"
        onClick={handleLoginClick}
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
        sx={{ 
          textTransform: 'none', 
          padding: '10px 20px',
          fontSize: '1rem'
        }}
      >
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </Button>
      {/* Error from useAuth hook will be displayed by the parent (LoginPage) */}
    </Box>
  );
};

export default GoogleLoginButton; 