import React from 'react';
import { Box, Container, Typography, Link, Stack, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'flex-start' },
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Box sx={{ mb: { xs: 3, md: 0 } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-start' },
              }}
            >
              <Box component="span" sx={{ color: 'error.main', fontWeight: 'bold', mr: 0.5 }}>
                Fail
              </Box>
              Mail
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Turn your rejections into stepping stones
            </Typography>
          </Box>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 2, sm: 4 }}
            alignItems="center"
          >
            <Link component={RouterLink} to="/privacy" color="text.secondary" underline="none">
              Privacy Policy
            </Link>
            <Link component={RouterLink} to="/terms" color="text.secondary" underline="none">
              Terms of Service
            </Link>
          </Stack>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="body2" color="text.secondary" align="center">
          © {currentYear} FailMail. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 