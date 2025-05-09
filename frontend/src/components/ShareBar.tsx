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
      
      // Find and temporarily hide the ShareBar
      const shareBarElement = targetElement.querySelector('.share-bar-container');
      if (shareBarElement) {
        shareBarElement.classList.add('hidden-for-capture');
      }
      
      html2canvas(targetElement, {
        allowTaint: true,
        useCORS: true, 
        scale: 2, // Higher resolution
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Hide the share bar in the cloned document
          const clonedShareBar = clonedDoc.querySelector('.share-bar-container');
          if (clonedShareBar) {
            (clonedShareBar as HTMLElement).style.display = 'none';
          }
        }
      }).then(canvas => {
        // Create a new canvas with padding and rounded corners
        const paddingX = 40; // Horizontal padding
        const paddingY = 40; // Padding for the image (no header text in canvas)
        const cornerRadius = 22; // Increased rounded corners value
        
        const newCanvas = document.createElement('canvas');
        const ctx = newCanvas.getContext('2d');
        
        if (!ctx) {
          reject("Could not get canvas context");
          return;
        }
        
        // Set dimensions with padding (no extra space for text)
        newCanvas.width = canvas.width + (paddingX * 2);
        newCanvas.height = canvas.height + (paddingY * 2); 
        
        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
        
        // Draw original canvas with padding
        ctx.drawImage(canvas, paddingX, paddingY);
        
        // Now we need to apply rounded corners
        // Create a temporary canvas to draw the final image with rounded corners
        const roundedCanvas = document.createElement('canvas');
        roundedCanvas.width = newCanvas.width;
        roundedCanvas.height = newCanvas.height;
        const roundedCtx = roundedCanvas.getContext('2d');
        
        if (!roundedCtx) {
          reject("Could not get rounded canvas context");
          return;
        }
        
        // Create rounded rectangle path
        roundedCtx.beginPath();
        roundedCtx.moveTo(cornerRadius, 0);
        roundedCtx.lineTo(roundedCanvas.width - cornerRadius, 0);
        roundedCtx.arcTo(roundedCanvas.width, 0, roundedCanvas.width, cornerRadius, cornerRadius);
        roundedCtx.lineTo(roundedCanvas.width, roundedCanvas.height - cornerRadius);
        roundedCtx.arcTo(roundedCanvas.width, roundedCanvas.height, roundedCanvas.width - cornerRadius, roundedCanvas.height, cornerRadius);
        roundedCtx.lineTo(cornerRadius, roundedCanvas.height);
        roundedCtx.arcTo(0, roundedCanvas.height, 0, roundedCanvas.height - cornerRadius, cornerRadius);
        roundedCtx.lineTo(0, cornerRadius);
        roundedCtx.arcTo(0, 0, cornerRadius, 0, cornerRadius);
        roundedCtx.closePath();
        
        // Clip to the rounded rectangle and draw the final image
        roundedCtx.clip();
        roundedCtx.drawImage(newCanvas, 0, 0);
        
        // Return the final image without any text on it
        resolve(roundedCanvas.toDataURL('image/png'));
        
        // Restore visibility of the ShareBar
        if (shareBarElement) {
          shareBarElement.classList.remove('hidden-for-capture');
        }
      }).catch(err => {
        // Restore visibility of the ShareBar in case of error
        if (shareBarElement) {
          shareBarElement.classList.remove('hidden-for-capture');
        }
        reject(err);
      });
    });
  };

  const downloadImage = async () => {
    try {
      // Get the screenshot without text
      const screenshotDataUrl = await captureDashboard();
      
      // Create a new image to load the screenshot
      const img = new Image();
      img.crossOrigin = "Anonymous";
      
      // When image is loaded, add the text overlay
      img.onload = () => {
        // Create a new canvas for the final image with text
        const finalCanvas = document.createElement('canvas');
        const finalCtx = finalCanvas.getContext('2d');
        
        if (!finalCtx) {
          console.error("Could not get final canvas context");
          return;
        }
        
        // Set canvas size to match the screenshot
        finalCanvas.width = img.width;
        finalCanvas.height = img.height + 130; // Further increased height for even larger text
        
        // Fill with white background
        finalCtx.fillStyle = '#ffffff';
        finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        
        // Add the FailMail text at the top with extremely large font
        const textX = 40; // Left padding for text
        const textY = 75; // Adjusted top position for larger text
        const fontSize = 84; // Dramatically larger font size
        
        // Draw "Fail" in red
        finalCtx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
        finalCtx.fillStyle = '#FA3149'; // Red color
        finalCtx.textAlign = 'left';
        finalCtx.textBaseline = 'middle';
        finalCtx.fillText('Fail', textX, textY);
        
        // Measure width of "Fail" to position "Mail" right after it
        const failWidth = finalCtx.measureText('Fail').width;
        
        // Draw "Mail" in black
        finalCtx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
        finalCtx.fillStyle = '#222222'; // Dark gray-black
        finalCtx.fillText('Mail', textX + failWidth - 3, textY);
        
        // Draw the screenshot below the text
        finalCtx.drawImage(img, 0, 130); // Position it below the larger text
        
        // Create download link
        const link = document.createElement('a');
        link.download = 'failmail-dashboard.png';
        link.href = finalCanvas.toDataURL('image/png');
        link.click();
        
        showNotification('Dashboard image downloaded successfully!', 'success');
      };
      
      // Set image source to trigger loading
      img.src = screenshotDataUrl;
      
    } catch (error) {
      console.error('Error downloading image:', error);
      showNotification('Failed to download image', 'error');
    }
  };

  const copyImageToClipboard = async () => {
    try {
      // Get the screenshot without text
      const screenshotDataUrl = await captureDashboard();
      
      // Create a new image to load the screenshot
      const img = new Image();
      img.crossOrigin = "Anonymous";
      
      // When image is loaded, add the text overlay
      img.onload = async () => {
        // Create a new canvas for the final image with text
        const finalCanvas = document.createElement('canvas');
        const finalCtx = finalCanvas.getContext('2d');
        
        if (!finalCtx) {
          console.error("Could not get final canvas context");
          return;
        }
        
        // Set canvas size to match the screenshot
        finalCanvas.width = img.width;
        finalCanvas.height = img.height; // Further increased height for even larger text
        
        // Fill with white background
        finalCtx.fillStyle = '#ffffff';
        finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        
        // Add the FailMail text at the top with extremely large font
        const textX = 40; // Left padding for text
        const textY = 120; // Adjusted top position for larger text
        const fontSize = 110; // Dramatically larger font size
        
        // Draw "Fail" in red
        finalCtx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
        finalCtx.fillStyle = '#FA3149'; // Red color
        finalCtx.textAlign = 'left';
        finalCtx.textBaseline = 'middle';
        finalCtx.fillText('Fail', textX, textY);
        
        // Measure width of "Fail" to position "Mail" right after it
        const failWidth = finalCtx.measureText('Fail').width;
        
        // Draw "Mail" in black
        finalCtx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
        finalCtx.fillStyle = '#222222'; // Dark gray-black
        finalCtx.fillText('Mail', textX + failWidth - 3, textY);
        
        // Draw the screenshot below the text
        finalCtx.drawImage(img, 0, 20); // Position it below the larger text
        
        // Get final image data
        const finalDataUrl = finalCanvas.toDataURL('image/png');
        
        // Convert data URL to blob
        const response = await fetch(finalDataUrl);
        const blob = await response.blob();
      
        // Copy to clipboard using Clipboard API if available
        if (navigator.clipboard && navigator.clipboard.write) {
          const item = new window.ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          showNotification('Image copied to clipboard!', 'success');
        } else {
          throw new Error('Clipboard API not supported');
        }
      };
      
      // Set image source to trigger loading
      img.src = screenshotDataUrl;
      
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showNotification('Failed to copy image to clipboard. Try using the download option instead.', 'error');
    }
  };

  const shareToTwitter = async () => {
    try {
      const text = "Check out my job rejection stats from FailMail! Embracing failure on my way to success. 💪 #FailMail #JobSearch";
      const url = "https://failmail.pro";
      
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, '_blank');
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
      showNotification('Failed to share to Twitter', 'error');
    }
  };

  const shareToLinkedIn = async () => {
    try {
      const url = "https://failmail.pr";
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
      className="share-bar-container" // Add class for easy targeting
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
          backgroundColor: 'rgba(248, 249, 250, 0.7)',
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