import React from 'react';
import { 
  AppBar, 
  Box, 
  Button, 
  Container, 
  Toolbar, 
  Typography,
  useScrollTrigger,
  Slide,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onStartScan?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onStartScan }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Hide navbar on scroll down, show on scroll up
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ 
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ height: 64 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Typography
                variant="h6"
                component={Link}
                to="/"
                sx={{
                  mr: 2,
                  fontWeight: 700,
                  textDecoration: 'none',
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
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
            </motion.div>

            <Box sx={{ flexGrow: 1 }} />

            <Box>
              <Button
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variant="contained"
                color="error"
                onClick={onStartScan}
                sx={{
                  borderRadius: '20px',
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                {isMobile ? 'Start' : 'Start Scan'}
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Slide>
  );
};

export default Navbar; 