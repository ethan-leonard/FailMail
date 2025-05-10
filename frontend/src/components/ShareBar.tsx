import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
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
    chartData?: Record<string, number>; // Chart data as an object
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
        const gradient = ctx.createLinearGradient(0, 0, cardWidth, cardHeight);
        gradient.addColorStop(0, '#ffe6e9');  // soft pink
        gradient.addColorStop(1, '#ffffff');  // to white
        
        ctx.fillStyle = gradient;
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
        
        // Add subtle noise texture
        try {
          const noise = new Image();
          noise.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAMUlEQVR4AWP4//8/Azbw///vz8DAwMiABwyMAQYGAyQZDAwMPQAyXhAIzJIC0OgkQBgAOqAlCy1LyA0AAAAASUVORK5CYII='; // subtle noise
          
          await new Promise((resolve, reject) => {
            noise.onload = resolve;
            noise.onerror = reject;
          });
          
          ctx.globalAlpha = 0.08; // control texture intensity
          ctx.drawImage(noise, 0, 0, cardWidth, cardHeight);
          ctx.globalAlpha = 1.0; // reset
        } catch (e) {
          console.log('Noise texture could not be loaded, skipping');
        }
        
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
        
        // Draw chart - NEW APPROACH
        // Check if we have chart data to visualize
        const chartData = userStats?.chartData || getChartDataFromDom();
        
        if (chartData && Object.keys(chartData).length > 0) {
          try {
            // Create a temporary div to hold our custom chart
            const tempChartContainer = document.createElement('div');
            tempChartContainer.style.position = 'absolute';
            tempChartContainer.style.left = '-9999px'; // Off screen
            tempChartContainer.style.width = '1050px';  // Increased width from 1000px to 1050px
            tempChartContainer.style.height = '450px'; 
            document.body.appendChild(tempChartContainer);
            
            // Parse the chart data into the format expected by Recharts
            const formattedChartData = Object.entries(chartData)
              .map(([month, count]) => {
                // Format date string for display
                try {
                  const date = new Date(month);
                  const formattedMonth = date.toLocaleString('default', { month: 'short', year: '2-digit' });
                  return {
                    name: formattedMonth,
                    rejections: count as number,
                    month
                  };
                } catch (e) {
                  return {
                    name: month,
                    rejections: count as number,
                    month
                  };
                }
              })
              .sort((a, b) => a.month.localeCompare(b.month))
              .slice(-12); // Only show the most recent 12 months, same as in RejectionChart.tsx
            
            // Render our fixed-size chart into the temporary container
            // We'll use ReactDOM.render (or createRoot for React 18+)
            const tempRoot = document.createElement('div');
            tempRoot.style.width = '100%';
            tempRoot.style.height = '100%';
            tempChartContainer.appendChild(tempRoot);
            
            // Dynamically render the chart
            const chartElement = document.createElement('div');
            chartElement.style.width = '100%';
            chartElement.style.height = '100%';
            tempRoot.appendChild(chartElement);
            
            // Find the maximum value for the y-axis
            const maxValue = Math.max(...formattedChartData.map(item => (item.rejections as number)), 8);
            const yDomain = [0, Math.ceil(maxValue * 1.2)]; // Add 20% headroom
            
            // Render chart directly with DOM
            chartElement.innerHTML = `
              <div style="width: 1050px; height: 450px; background-color: transparent;">
                <svg width="1050" height="450" viewBox="0 0 1050 450" xmlns="http://www.w3.org/2000/svg">
                  <!-- Main Axes -->
                  <g class="recharts-cartesian-axes">
                    <!-- Y-Axis line -->
                    <line x1="50" y1="25" x2="50" y2="375" stroke="rgba(0,0,0,0.5)" stroke-width="1" />
                    <!-- X-Axis line -->
                    <line x1="50" y1="375" x2="1000" y2="375" stroke="rgba(0,0,0,0.5)" stroke-width="1" />
                  </g>

                  <!-- Grid Lines -->
                  <g class="recharts-cartesian-grid">
                    ${Array.from({ length: 5 }).map((_, i) => {
                      const y = 25 + (350 - (i * 87.5)); // Adjusted for taller chart (450px)
                      return `<line x1="50" y1="${y}" x2="1000" y2="${y}" stroke="rgba(0,0,0,0.1)" stroke-dasharray="3 3" />`;
                    }).join('')}
                  </g>
                  
                  <!-- Y-Axis Labels -->
                  <g class="recharts-y-axis">
                    ${Array.from({ length: 5 }).map((_, i) => {
                      const y = 30 + (350 - (i * 87.5)); // Adjusted for taller chart
                      const value = Math.round((i * yDomain[1]/4));
                      return `<text x="40" y="${y}" text-anchor="end" fill="rgba(0,0,0,0.75)" font-size="14" font-weight="600">${value}</text>`;
                    }).join('')}
                  </g>
                  
                  <!-- X-Axis Lines (tick marks) -->
                  <g class="recharts-cartesian-axis-line">
                    ${formattedChartData.map((_item, i) => {
                      const x = 50 + ((i + 0.5) * ((950) / formattedChartData.length)); // Wider chart area (950 instead of 900)
                      return `<line x1="${x}" y1="375" x2="${x}" y2="385" stroke="rgba(0,0,0,0.5)" stroke-width="1" />`;
                    }).join('')}
                  </g>
                  
                  <!-- X-Axis Labels -->
                  <g class="recharts-x-axis">
                    ${formattedChartData.map((item, i) => {
                      const x = 50 + ((i + 0.5) * ((950) / formattedChartData.length)); // Wider chart area
                      return `<text x="${x}" y="410" text-anchor="middle" fill="rgba(0,0,0,0.75)" font-size="14" font-weight="600">${item.name}</text>`;
                    }).join('')}
                  </g>
                  
                  <!-- Bars -->
                  <g class="recharts-bar">
                    ${formattedChartData.map((item, i) => {
                      const barWidth = Math.min(((950) / formattedChartData.length) - 10, 75); // Wider bars
                      const x = 50 + ((i + 0.5) * ((950) / formattedChartData.length)) - (barWidth / 2); // Wider chart area
                      const barHeight = (item.rejections as number / yDomain[1]) * 350; // Adjusted for taller chart
                      const y = 375 - barHeight; // Adjusted for taller chart
                      return `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="#FA3149" />`;
                    }).join('')}
                  </g>
                </svg>
              </div>
            `;
            
            // Wait a bit to ensure everything renders
            await new Promise(r => setTimeout(r, 100));
            
            const chartCanvas = await html2canvas(chartElement, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: null
            });
            
            // Draw the captured chart onto our card
            const chartX = (cardWidth - 1050) / 2 + 12; // Center the chart and shift right by 20px
            const chartY = 330; // Lowered by 10px (from 320 to 330)
            
            ctx.drawImage(
              chartCanvas, 
              0, 0, chartCanvas.width, chartCanvas.height,
              chartX, chartY, 1050, 450 
            );
            
            // Clean up - remove the temporary elements
            document.body.removeChild(tempChartContainer);
            
          } catch (err) {
            console.error('Error creating custom chart:', err);
            
            // Still draw placeholder if chart creation fails
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

  // Helper function to get chart data from DOM if not provided in props
  const getChartDataFromDom = () => {
    try {
      // Try to find a data-chart attribute in the DOM with stringified chart data
      const chartDataElement = document.querySelector('[data-chart]');
      if (chartDataElement && chartDataElement.getAttribute('data-chart')) {
        return JSON.parse(chartDataElement.getAttribute('data-chart') || '{}');
      }
      
      // Alternatively, look for the props data on Dashboard that would have been passed to RejectionChart
      const rejectionChart = document.querySelector('.rejection-chart');
      if (rejectionChart && rejectionChart.hasAttribute('data-chartdata')) {
        return JSON.parse(rejectionChart.getAttribute('data-chartdata') || '{}');
      }
      
      // If all else fails, return empty object
      return {};
    } catch (e) {
      console.error('Error extracting chart data from DOM:', e);
      return {};
    }
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

  // Helper function to prepare image for sharing
  const prepareShareCard = async () => {
    try {
      // Use cached card data if available, otherwise generate a new one
      const cardUrl = cardDataUrl || await createStatsCard();
        
      // Copy to clipboard so user can paste in social media
      const response = await fetch(cardUrl);
      const blob = await response.blob();
      
      // Copy to clipboard using Clipboard API if available
      if (navigator.clipboard && navigator.clipboard.write) {
        const item = new window.ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        return true;
      } else {
        throw new Error('Clipboard API not supported');
      }
    } catch (error) {
      console.error('Error preparing share card:', error);
      return false;
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

  // Update the Twitter and LinkedIn sharing functions to include the image
  const shareToTwitter = async () => {
    try {
      // Use cached card data if available, otherwise generate a new one
      await prepareShareCard();
      
      const text = "Check out my job rejection stats from FailMail! Embracing failure on my way to success. 💪 #FailMail #JobSearch";
      const url = "https://failmail.pro";
      
      // Note: Twitter doesn't support direct image uploads via web intent
      // We'll open the Twitter intent without the image and notify the user
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, '_blank');
      
      // Notify user to attach the image manually
      showNotification('Share image has been copied to clipboard - paste it with your tweet!', 'success');
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
      showNotification('Failed to share to Twitter', 'error');
    }
  };

  const shareToLinkedIn = async () => {
    try {
      // Use cached card data if available, otherwise generate a new one
      await prepareShareCard();
      
      const url = "https://failmail.pro";
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
      window.open(linkedInUrl, '_blank');
      
      // Notify user to attach the image manually
      showNotification('Share image has been copied to clipboard - paste it with your post!', 'success');
    } catch (error) {
      console.error('Error sharing to LinkedIn:', error);
      showNotification('Failed to share to LinkedIn', 'error');
    }
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
        <Typography variant="subtitle1" fontWeight={600} sx={{ mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 } }}>
          <ShareIcon sx={{ mr: 0.5, verticalAlign: 'middle' }} />
          Share Your Rejection Journey
        </Typography>
        
        {/* Replace ButtonGroup with Grid for better mobile layout */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, auto)' },
          gap: 1,
          width: { xs: '100%', sm: 'auto' }
        }}>
          <Tooltip title="Download as image">
            <Button 
              variant="outlined"
              size="small"
              onClick={downloadImage} 
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              startIcon={<DownloadIcon />}
              disabled={isGeneratingCard}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              {isGeneratingCard ? 'Generating...' : 'Download'}
            </Button>
          </Tooltip>
          
          <Tooltip title="Copy to clipboard">
            <Button 
              variant="outlined"
              size="small"
              onClick={copyImageToClipboard} 
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              startIcon={<ContentCopyIcon />}
              disabled={isGeneratingCard}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Copy
            </Button>
          </Tooltip>
          
          <Tooltip title="Share to Twitter">
            <Button 
              variant="outlined"
              size="small"
              onClick={shareToTwitter} 
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              startIcon={<TwitterIcon />}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Twitter
            </Button>
          </Tooltip>
          
          <Tooltip title="Share to LinkedIn">
            <Button
              variant="outlined"
              size="small"
              onClick={shareToLinkedIn} 
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              startIcon={<LinkedInIcon />}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              LinkedIn
            </Button>
          </Tooltip>
        </Box>
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