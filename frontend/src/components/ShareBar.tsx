import React, { useState } from 'react';
import { Button, Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Download as DownloadIcon, Share as ShareIcon } from '@mui/icons-material';
import html2canvas from 'html2canvas';

interface ShareBarProps {
  /** DOM element ID of the main widget area to capture */
  targetElementId: string;
}

const ShareBar: React.FC<ShareBarProps> = ({ targetElementId }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const captureScreenshot = async (): Promise<string | null> => {
    const elementToCapture = document.getElementById(targetElementId);
    if (!elementToCapture) {
      console.error("Target element for screenshot not found");
      setSnackbar({ open: true, message: 'Error: Could not find dashboard area to share.', severity: 'error' });
      return null;
    }

    try {
      // Ensure theme background is applied for canvas if it's transparent by default
      const canvas = await html2canvas(elementToCapture, {
        useCORS: true, 
        logging: false,
        backgroundColor: window.getComputedStyle(document.body).getPropertyValue('background-color') || 'white',
        scale: 2, // Higher scale for better quality
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error("Error capturing screenshot:", error);
      setSnackbar({ open: true, message: 'Error capturing image. See console for details.', severity: 'error' });
      return null;
    }
  };

  const handleDownload = async () => {
    setIsProcessing(true);
    const imageBase64 = await captureScreenshot();
    setIsProcessing(false);

    if (imageBase64) {
      const link = document.createElement('a');
      link.href = imageBase64;
      link.download = 'rejection-dashboard-summary.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSnackbar({ open: true, message: 'Dashboard image downloaded!', severity: 'success' });
    }
  };

  const handleShare = async () => {
    setIsProcessing(true);
    const imageBase64 = await captureScreenshot();
    setIsProcessing(false);

    if (!imageBase64) return;

    if (navigator.share) {
      try {
        // Convert base64 to Blob for navigator.share API
        const response = await fetch(imageBase64);
        const blob = await response.blob();
        const file = new File([blob], 'rejection-dashboard-summary.png', { type: 'image/png' });

        await navigator.share({
          title: 'My Job Rejection Stats',
          text: 'Check out my job application stats from Rejection Dashboard!',
          files: [file],
        });
        setSnackbar({ open: true, message: 'Shared successfully!', severity: 'success' });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback or specific error handling if share fails (e.g. user cancelled)
        if ((error as Error).name !== 'AbortError') {
            setSnackbar({ open: true, message: 'Could not share. Try downloading instead.', severity: 'error' });
        }
      }
    } else {
      setSnackbar({ open: true, message: 'Web Share API not supported. Try downloading.', severity: 'error' });
      // Fallback for browsers that don't support navigator.share (e.g. copy to clipboard or just download)
      // For MVP, we can just notify the user.
    }
  };

  return (
    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Button
        variant="outlined"
        startIcon={isProcessing ? <CircularProgress size={20} /> : <DownloadIcon />}
        onClick={handleDownload}
        disabled={isProcessing}
      >
        Download PNG
      </Button>
      {navigator.share && (
        <Button
          variant="contained"
          startIcon={isProcessing ? <CircularProgress size={20} /> : <ShareIcon />}
          onClick={handleShare}
          disabled={isProcessing}
        >
          Share Stats
        </Button>
      )}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ShareBar; 