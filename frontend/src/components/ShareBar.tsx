import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  ButtonGroup, 
  Tooltip, 
  Typography, 
  Snackbar, 
  Alert,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';

// Icons
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

interface ShareBarProps {
  /** DOM element ID of the main widget area to capture */
  targetElementId: string;
}

// Add ClipboardItem to the window type
declare global {
  interface Window {
    ClipboardItem: any;
  }
}

const ShareBar: React.FC<ShareBarProps> = ({ targetElementId }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
  const theme = useTheme();

  const captureDashboard = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const targetElement = document.getElementById(targetElementId);
      
      if (!targetElement) {
        reject("Target element not found");
        return;
      }
      
      html2canvas(targetElement, {
        allowTaint: true,
        useCORS: true,
        scale: 2, // Higher resolution
        backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#ffffff',
      }).then(canvas => {
        resolve(canvas.toDataURL('image/png'));
      }).catch(err => {
        reject(err);
      });
    });
  };

  const downloadImage = async () => {
    try {
      const dataUrl = await captureDashboard();
      const link = document.createElement('a');
      link.download = 'rejection-dashboard.png';
      link.href = dataUrl;
      link.click();
      showNotification('Dashboard image downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading image:', error);
      showNotification('Failed to download image', 'error');
    }
  };

  const copyImageToClipboard = async () => {
    try {
      const dataUrl = await captureDashboard();
      
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Copy to clipboard using Clipboard API if available
      if (navigator.clipboard && navigator.clipboard.write) {
        const item = new window.ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        showNotification('Image copied to clipboard!', 'success');
      } else {
        throw new Error('Clipboard API not supported');
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showNotification('Failed to copy image to clipboard. Try using the download option instead.', 'error');
    }
  };

  const shareToTwitter = async () => {
    try {
      const text = "Check out my job rejection stats from FailMail! Embracing failure on my way to success. 💪 #FailMail #JobSearch";
      const url = "https://failmail.app";
      
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, '_blank');
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
      showNotification('Failed to share to Twitter', 'error');
    }
  };

  const shareToLinkedIn = async () => {
    try {
      const url = "https://failmail.app";
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
      window.open(linkedInUrl, '_blank');
    } catch (error) {
      console.error('Error sharing to LinkedIn:', error);
      showNotification('Failed to share to LinkedIn', 'error');
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setShowAlert(true);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 2,
          mt: 4, 
          mb: 2,
          p: 2,
          borderRadius: 3,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.5)' : 'rgba(248, 249, 250, 0.7)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} sx={{ mr: { xs: 0, sm: 2 } }}>
          <ShareIcon sx={{ mr: 0.5, verticalAlign: 'middle' }} />
          Share Your Rejection Journey
        </Typography>
        
        <ButtonGroup 
          variant="outlined" 
          size="small" 
          sx={{ 
            '& .MuiButton-root': {
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }
          }}
        >
          <Tooltip title="Download as image">
            <Button 
              onClick={downloadImage} 
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              startIcon={<DownloadIcon />}
            >
              Download
            </Button>
          </Tooltip>
          
          <Tooltip title="Copy to clipboard">
            <Button 
              onClick={copyImageToClipboard} 
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              startIcon={<ContentCopyIcon />}
            >
              Copy
            </Button>
          </Tooltip>
          
          <Tooltip title="Share to Twitter">
            <Button 
              onClick={shareToTwitter} 
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              startIcon={<TwitterIcon />}
            >
              Twitter
            </Button>
          </Tooltip>
          
          <Tooltip title="Share to LinkedIn">
            <Button 
              onClick={shareToLinkedIn} 
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              startIcon={<LinkedInIcon />}
            >
              LinkedIn
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Box>
      
      <Snackbar open={showAlert} autoHideDuration={5000} onClose={handleCloseAlert}>
        <Alert 
          onClose={handleCloseAlert} 
          severity={alertSeverity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default ShareBar; 