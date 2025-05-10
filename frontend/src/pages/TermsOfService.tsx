import React from 'react';
import { Box, Container, Typography, Paper, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="md" sx={{ flexGrow: 1, py: 6 }}>
        <Box mb={4}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link component={RouterLink} to="/" color="inherit" underline="hover">
              Home
            </Link>
            <Typography color="text.primary">Terms of Service</Typography>
          </Breadcrumbs>
        </Box>

        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            mb: 6, 
            border: '1px solid', 
            borderColor: 'divider',
            borderRadius: 2,
            textAlign: 'left'
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom fontWeight={700} align="left">
            Terms of Service
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom align="left">
            Effective Date: {currentDate}
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" component="h2" gutterBottom fontWeight={600} align="left">
              1. Acceptance of Terms
            </Typography>
            <Typography paragraph align="left">
              By accessing and using FailMail ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
              If you do not agree to these Terms, please do not use the Service.
            </Typography>

            <Typography variant="h6" component="h2" gutterBottom fontWeight={600} align="left">
              2. Description of Service
            </Typography>
            <Typography paragraph align="left">
              FailMail is a web-based application that allows users to view their Gmail messages through a secure interface. 
              The Service accesses your Gmail data with your explicit consent via Google's OAuth 2.0 mechanism. 
              The data retrieved is:
            </Typography>
            <Box component="ul" sx={{ 
              pl: 4, 
              listStylePosition: 'outside',
              '& li': {
                display: 'list-item',
                mb: 1
              } 
            }}>
              <li>Processed in real-time.</li>
              <li>Not stored on our servers.</li>
              <li>Not shared with third parties.</li>
            </Box>

            <Typography variant="h6" component="h2" gutterBottom fontWeight={600} align="left">
              3. User Obligations
            </Typography>
            <Typography paragraph align="left">
              You agree to use the Service in compliance with all applicable laws and regulations. You must not:
            </Typography>
            <Box component="ul" sx={{ 
              pl: 4, 
              listStylePosition: 'outside',
              '& li': {
                display: 'list-item',
                mb: 1
              } 
            }}>
              <li>Use the Service for any unlawful purpose.</li>
              <li>Attempt to gain unauthorized access to any part of the Service.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service.</li>
            </Box>

            <Typography variant="h6" component="h2" gutterBottom fontWeight={600} align="left">
              4. Intellectual Property
            </Typography>
            <Typography paragraph align="left">
              All content, trademarks, and data on the Service, including but not limited to software, databases, 
              text, graphics, icons, and hyperlinks are the property of FailMail and are protected by law. 
              Unauthorized use is prohibited.
            </Typography>

            <Typography variant="h6" component="h2" gutterBottom fontWeight={600} align="left">
              5. Disclaimer of Warranties
            </Typography>
            <Typography paragraph align="left">
              The Service is provided "as is" without warranties of any kind, either express or implied. 
              We do not warrant that the Service will be uninterrupted or error-free.
            </Typography>

            <Typography variant="h6" component="h2" gutterBottom fontWeight={600} align="left">
              6. Limitation of Liability
            </Typography>
            <Typography paragraph align="left">
              In no event shall FailMail be liable for any indirect, incidental, special, consequential, 
              or punitive damages arising out of or related to your use of the Service.
            </Typography>

            <Typography variant="h6" component="h2" gutterBottom fontWeight={600} align="left">
              7. Modifications to Terms
            </Typography>
            <Typography paragraph align="left">
              We reserve the right to modify these Terms at any time. Changes will be posted on this page 
              with an updated effective date. Your continued use of the Service after changes have been 
              posted constitutes your acceptance of the new Terms.
            </Typography>

            <Typography variant="h6" component="h2" gutterBottom fontWeight={600} align="left">
              8. Governing Law
            </Typography>
            <Typography paragraph align="left">
              These Terms shall be governed by and construed in accordance with the laws of the United States, 
              without regard to its conflict of law principles.
            </Typography>

            <Typography variant="h6" component="h2" gutterBottom fontWeight={600} align="left">
              9. Contact Information
            </Typography>
            <Typography paragraph align="left">
              If you have any questions about these Terms, please contact us at:
            </Typography>
            <Typography paragraph align="left">
              FailMail<br />
              Email: support@failmail.pro<br />
              Website: https://failmail.pro
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default TermsOfService; 