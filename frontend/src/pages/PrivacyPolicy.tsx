import React from 'react';
import { Box, Container, Typography, Paper, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
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
            <Typography color="text.primary">Privacy Policy</Typography>
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
            Privacy Policy
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom align="left">
            Effective Date: {currentDate}
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" component="h2" gutterBottom fontWeight={600} align="left">
              1. Introduction
            </Typography>
            <Typography paragraph align="left">
              FailMail ("we," "our," or "us") is committed to protecting your privacy. 
              This Privacy Policy outlines our practices regarding the collection, use, 
              and disclosure of information when you use our application, FailMail.
            </Typography>

            <Typography variant="h6" component="h2" gutterBottom fontWeight={600} align="left">
              2. Information We Collect
            </Typography>
            <Typography paragraph align="left">
              We do not collect, store, or share any personal information from users of FailMail. 
              Our application functions without maintaining any databases or persistent storage of user data.
            </Typography>

            <Typography variant="h6" component="h2" gutterBottom fontWeight={600} align="left">
              3. Use of Google User Data
            </Typography>
            <Typography paragraph align="left">
              FailMail accesses your Gmail data solely to display email content within the application interface. 
              This access is facilitated through the Gmail API with your explicit consent via Google's 
              OAuth 2.0 mechanism. The data retrieved is:
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
              4. Data Security
            </Typography>
            <Typography paragraph align="left">
              Even though we do not store user data, we implement industry-standard security measures to protect 
              the data during transmission. This includes:
            </Typography>
            <Box component="ul" sx={{ 
              pl: 4, 
              listStylePosition: 'outside',
              '& li': {
                display: 'list-item',
                mb: 1
              } 
            }}>
              <li>Secure HTTPS connections.</li>
              <li>Regular security assessments of our FastAPI backend and Vite frontend.</li>
            </Box>

            <Typography variant="h6" component="h2" gutterBottom fontWeight={600} align="left">
              5. Third-Party Services
            </Typography>
            <Typography paragraph align="left">
              FailMail does not integrate with third-party services that collect or process user data. 
              All functionalities are handled within our controlled environment.
            </Typography>

            <Typography variant="h6" component="h2" gutterBottom fontWeight={600} align="left">
              6. Children's Privacy
            </Typography>
            <Typography paragraph align="left">
              FailMail is not intended for use by individuals under the age of 13. 
              We do not knowingly collect personal information from children under 13.
            </Typography>

            <Typography variant="h6" component="h2" gutterBottom fontWeight={600} align="left">
              7. Changes to This Privacy Policy
            </Typography>
            <Typography paragraph align="left">
              We may update our Privacy Policy from time to time. Any changes will be posted on 
              this page with an updated effective date.
            </Typography>

            <Typography variant="h6" component="h2" gutterBottom fontWeight={600} align="left">
              8. Contact Us
            </Typography>
            <Typography paragraph align="left">
              If you have any questions or concerns about this Privacy Policy, please contact us at:
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

export default PrivacyPolicy; 