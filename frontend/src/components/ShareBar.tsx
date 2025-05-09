import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  ButtonGroup, 
  Tooltip, 
  Typography, 
  Snackbar, 
  Alert,
  CircularProgress,
  Modal
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
  /** User stats to display on the card */
  userStats?: {
    username: string;
    totalRejections: number;
    monthlyRejections: number;
    chartData?: any; // Will need proper typing based on your chart data structure
    chartDataKey?: string; // Added for dependency tracking
  };
}

// Add ClipboardItem to the window type
declare global {
  interface Window {
    ClipboardItem: any;
  }
}

const ShareBar: React.FC<ShareBarProps> = ({ userStats }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
  const [cardDataUrl, setCardDataUrl] = useState<string | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);

  // Extract stat values - props first, then DOM fallback
  const extractUserStats = () => {
    const defaultUsername = 'Anonymous';
    const defaultNumericStat = 0;

    let username = userStats?.username;
    let totalRejections = userStats?.totalRejections;
    let monthlyRejections = userStats?.monthlyRejections;

    // Fallback for username if prop is missing or default
    if (!username || username === defaultUsername) {
      const usernameElement = document.querySelector('[data-user="username"]');
      if (usernameElement && usernameElement.textContent && usernameElement.textContent.trim() !== '') {
        username = usernameElement.textContent.trim();
      }
    }

    // Fallback for totalRejections if prop is not a valid number
    if (typeof totalRejections !== 'number') {
      const card = document.querySelector('[data-stat="total-rejections"]');
      // The StatsCard renders its value in an h3 tag (or a Typography with variant h3)
      const valueElement = card?.querySelector('h3'); 
      if (valueElement && valueElement.textContent) {
        const value = parseInt(valueElement.textContent.replace(/\D/g, ''));
        if (!isNaN(value)) {
          totalRejections = value;
        }
      }
    }

    // Fallback for monthlyRejections if prop is not a valid number
    if (typeof monthlyRejections !== 'number') {
      const card = document.querySelector('[data-stat="monthly-rejections"]');
      const valueElement = card?.querySelector('h3');
      if (valueElement && valueElement.textContent) {
        const value = parseInt(valueElement.textContent.replace(/\D/g, ''));
        if (!isNaN(value)) {
          monthlyRejections = value;
        }
      }
    }
    
    // Ensure final values are set, defaulting if all sources failed
    username = username || defaultUsername;
    totalRejections = typeof totalRejections === 'number' ? totalRejections : defaultNumericStat;
    monthlyRejections = typeof monthlyRejections === 'number' ? monthlyRejections : defaultNumericStat;

    return { username, totalRejections, monthlyRejections };
  };

  // Function to create a custom stats card
  const createStatsCard = async (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      setIsGeneratingCard(true);
      try {
        // Get stats - first from props, fallback to DOM extraction
        const stats = extractUserStats();
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          setIsGeneratingCard(false);
          reject("Could not get canvas context");
          return;
        }
        
        // Set card dimensions
        const cardWidth = 1200;
        const cardHeight = 800;
        const cornerRadius = 40;
        
        canvas.width = cardWidth;
        canvas.height = cardHeight;
        
        // Draw white background with rounded corners
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cornerRadius, 0);
        ctx.lineTo(cardWidth - cornerRadius, 0);
        ctx.arcTo(cardWidth, 0, cardWidth, cornerRadius, cornerRadius);
        ctx.lineTo(cardWidth, cardHeight - cornerRadius);
        ctx.arcTo(cardWidth, cardHeight, cardWidth - cornerRadius, cardHeight, cornerRadius);
        ctx.lineTo(cornerRadius, cardHeight);
        ctx.arcTo(0, cardHeight, 0, cardHeight - cornerRadius, cornerRadius);
        ctx.lineTo(0, cornerRadius);
        ctx.arcTo(0, 0, cornerRadius, 0, cornerRadius);
        ctx.closePath();
        ctx.fill();
        
        // Add subtle border
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw header section
        const username = stats.username;
        
        // Draw "Username's" in black
        ctx.font = '850 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        ctx.fillStyle = '#222222';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`${username}'s`, 40, 40);
        
        // Draw "Fail" in red
        ctx.font = '850 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        ctx.fillStyle = '#FA3149';
        const usernameWidth = ctx.measureText(`${username}'s `).width;
        ctx.fillText('Fail', 50 + usernameWidth, 38);
        
        // Measure width of "Fail" to position "Mail" right after it
        const failWidth = ctx.measureText('Fail').width + 20;
        
        // Draw "Mail" in black
        ctx.font = '700 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        ctx.fillStyle = '#222222';
        ctx.fillText('Mail', 40 + usernameWidth + failWidth - 3, 38);
        
        // Add "failmail.pro" in the top right
        ctx.font = 'italic 600 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('failmail.pro', cardWidth - 40, 46);
        
        // Draw stats section
        // Get rejection data
        const totalRejections = stats.totalRejections;
        const monthlyRejections = stats.monthlyRejections;
        
        console.log('Creating card with stats:', { username, totalRejections, monthlyRejections });
        
        // Draw Total Rejections
        ctx.textAlign = 'left';
        ctx.font = '600 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        ctx.fillStyle = '#333333';
        ctx.fillText('Total Rejections', 80, 160);
        
        ctx.font = '800 84px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        ctx.fillStyle = '#FA3149';
        ctx.fillText(totalRejections.toString(), 80, 220);
        
        // Draw Monthly Rejections
        ctx.font = '600 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        ctx.fillStyle = '#333333';
        ctx.fillText('Rejections This Month', 500, 160);
        
        ctx.font = '800 84px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        ctx.fillStyle = '#FA3149';
        ctx.fillText(monthlyRejections.toString(), 500, 220);
        
        // Draw chart
        // If chart element exists, capture it
        const chartElement = document.querySelector('.rejection-chart');
        if (chartElement) {
          try {
            // Add a small delay to allow the chart to render, especially if it has animations
            await new Promise(r => setTimeout(r, 2500)); // Increased delay to 2500ms

            const chartCanvas = await html2canvas(chartElement as HTMLElement, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff' // Explicitly set background for the chart capture part
            });
            
            // Calculate positioning to center the chart in the bottom section
            const chartWidth = Math.min(chartCanvas.width, cardWidth - 160);
            const chartHeight = (chartWidth / chartCanvas.width) * chartCanvas.height;
            const chartX = (cardWidth - chartWidth - 45) / 2;
            const chartY = 350;
            
            ctx.drawImage(
              chartCanvas, 
              0, 0, chartCanvas.width, chartCanvas.height,
              chartX, chartY, chartWidth, chartHeight
            );
          } catch (err) {
            console.error('Error capturing chart:', err);
            // Draw placeholder text if chart capture fails
            ctx.font = '500 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
            ctx.fillStyle = '#666666';
            ctx.textAlign = 'center';
            ctx.fillText('Yearly Rejection Chart', cardWidth / 2, 500);
          }
        } else {
          // Draw placeholder or message when chart isn't available
          ctx.font = '500 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
          ctx.fillStyle = '#666666';
          ctx.textAlign = 'center';
          ctx.fillText('Yearly Rejection Chart', cardWidth / 2, 500);
        }
        
        // Add motivational footer
        ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        ctx.fillStyle = '#333333';
        ctx.textAlign = 'center';
        ctx.fillText('An inbox full of character development 🥲', cardWidth / 2, cardHeight - 36);
        
        // Return data URL of the canvas
        const dataUrl = canvas.toDataURL('image/png');
        setCardDataUrl(dataUrl);
        setIsGeneratingCard(false);
        resolve(dataUrl);
      } catch (error) {
        console.error('Error creating stats card:', error);
        setIsGeneratingCard(false);
        reject(error);
      }
    });
  };

  // Prepare the card when component mounts to avoid delay during download
  useEffect(() => {
    // Create the card once when component mounts
    createStatsCard().then(url => {
      setCardDataUrl(url);
    }).catch(err => {
      console.error('Error pre-generating card:', err);
    });
    
    // Re-create the card whenever userStats changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userStats?.totalRejections, userStats?.monthlyRejections, userStats?.username, userStats?.chartDataKey]);

  const downloadImage = async () => {
    try {
      // Use cached card data if available, otherwise generate a new one
      const cardUrl = cardDataUrl || await createStatsCard();
      
      // Create download link
      const link = document.createElement('a');
      link.download = 'failmail-stats.png';
      link.href = cardUrl;
      link.click();
      
      showNotification('Stats card downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading stats card:', error);
      showNotification('Failed to download stats card', 'error');
    }
  };

  const copyImageToClipboard = async () => {
    try {
      // Use cached card data if available, otherwise generate a new one
      const cardUrl = cardDataUrl || await createStatsCard();
        
        // Convert data URL to blob
      const response = await fetch(cardUrl);
        const blob = await response.blob();
      
        // Copy to clipboard using Clipboard API if available
        if (navigator.clipboard && navigator.clipboard.write) {
          const item = new window.ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
        showNotification('Stats card copied to clipboard!', 'success');
        } else {
          throw new Error('Clipboard API not supported');
        }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showNotification('Failed to copy image to clipboard. Try using the download option instead.', 'error');
    }
  };

  // Keeping the existing social media sharing methods
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
      const url = "https://failmail.pro";
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
              disabled={isGeneratingCard}
            >
              {isGeneratingCard ? 'Generating...' : 'Download'}
            </Button>
          </Tooltip>
          
          <Tooltip title="Copy to clipboard">
            <Button 
              onClick={copyImageToClipboard} 
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              startIcon={<ContentCopyIcon />}
              disabled={isGeneratingCard}
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

      {/* Loading Overlay Modal */}
      <Modal
        open={isGeneratingCard}
        aria-labelledby="generating-card-title"
        aria-describedby="generating-card-description"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
            boxShadow: 24,
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <CircularProgress color="error" sx={{ mb: 2 }} />
          <Typography id="generating-card-title" variant="h6" component="h2">
            Generating Your FailMail Card
          </Typography>
          <Typography id="generating-card-description" sx={{ mt: 1, color: 'text.secondary' }}>
            Please wait a moment...
          </Typography>
        </Box>
      </Modal>
    </motion.div>
  );
};

export default ShareBar; 