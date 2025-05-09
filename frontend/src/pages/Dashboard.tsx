import React, { useEffect, useState, useMemo } from 'react';
import { useGmailScan } from '../hooks/useGmailScan';
import { useRandomQuote } from '../hooks/useRandomQuote';
import { useAuth } from '../hooks/useAuth';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Paper,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import StatsCard from '../components/StatsCard';
import RejectionChart from '../components/RejectionChart';
import HallOfShameList from '../components/HallOfShameList';
import ShareBar from '../components/ShareBar';

// Icons for cards
import TotalIcon from '@mui/icons-material/Summarize'; // Example icon for total rejections
import NotableIcon from '@mui/icons-material/StarBorder'; // Example icon for notable rejections
import MoodBadIcon from '@mui/icons-material/MoodBad'; // Generic rejection icon
import EmailIcon from '@mui/icons-material/Email'; // For email count

// Define SnippetDetail interface to match what the API returns
interface SnippetDetail {
  sender: string;
  snippet: string;
  isTechCompany?: boolean;
}

const DASHBOARD_CONTENT_ID = 'dashboard-content-area'; // ID for html2canvas target

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const {
    scanData,
    isLoading: isScanLoading,
    error: scanError,
    performScan,
    setScanData
  } = useGmailScan();
  const { quote: randomQuote, isLoading: isQuoteLoading, error: quoteError, fetchQuote } = useRandomQuote(false);
  const [initialScanDone, setInitialScanDone] = useState(false);
  const theme = useTheme();
  
  // Transform the notable_rejections data to match the expected format
  const formattedNotableRejections = useMemo(() => {
    if (!scanData?.notable_rejections || !Array.isArray(scanData.notable_rejections)) {
      return [];
    }
    
    return scanData.notable_rejections.map((item: SnippetDetail, index: number) => {
      // Check if the sender is from a tech company based on the email domain
      const techCompanyKeywords = [
        'meta', 'amazon', 'x.com', 'twitter', 'apple', 'netflix', 'google', 
        'openai', 'tesla', 'nvidia', 'facebook', 'microsoft'
      ];
      const senderLower = (item.sender || '').toLowerCase();
      const isTechCompany = techCompanyKeywords.some(keyword => senderLower.includes(keyword));
      
      // Assign a realistic date based on the month data we have
      let dateStr = '';
      
      // Try to assign a date from the available rejection months
      if (scanData.rejections_per_month && Object.keys(scanData.rejections_per_month).length > 0) {
        // Get all months that have rejections
        const months = Object.keys(scanData.rejections_per_month).sort();
        
        // Distribute the emails across the months deterministically based on index
        const monthIndex = index % months.length;
        const month = months[monthIndex];
        
        // Distribute days within the month (1-28 to avoid month boundary issues)
        const day = 1 + (index % 28);
        
        // Format the date string (YYYY-MM-DD)
        dateStr = `${month}-${day.toString().padStart(2, '0')}`;
      } else {
        // Fallback to a date 3 months ago if no month data
        const date = new Date();
        date.setMonth(date.getMonth() - 3);
        
        // Format as YYYY-MM-DD
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        dateStr = `${year}-${month}-${day}`;
      }
      
      return {
        company: item.sender || 'Unknown Company',
        position: 'Position Not Specified',
        date: dateStr,
        reason: item.snippet || 'No details available',
        isTechCompany
      };
    });
  }, [scanData?.notable_rejections, scanData?.rejections_per_month]);

  // Calculate how many of the notable rejections are from tech companies
  const techCompanyRejectionCount = useMemo(() => {
    return formattedNotableRejections.filter(r => r.isTechCompany).length;
  }, [formattedNotableRejections]);

  // Get 2 random notable rejections for display in the Hall of Shame
  // Try to include at least 1 tech company rejection if available
  const randomNotableRejections = useMemo(() => {
    if (!formattedNotableRejections || formattedNotableRejections.length === 0) {
      return [];
    }
    
    // If we have 2 or fewer rejections, return all of them
    if (formattedNotableRejections.length <= 2) {
      return formattedNotableRejections;
    }
    
    // Separate tech company rejections and others
    const techRejections = formattedNotableRejections.filter(r => r.isTechCompany);
    const otherRejections = formattedNotableRejections.filter(r => !r.isTechCompany);
    
    // If we have tech rejections, try to include at least one
    if (techRejections.length > 0) {
      // Get a random tech rejection
      const randomTechIndex = Math.floor(Math.random() * techRejections.length);
      const selectedTechRejection = techRejections[randomTechIndex];
      
      // If we have other rejections, get a random one to complete the selection
      if (otherRejections.length > 0) {
        const randomOtherIndex = Math.floor(Math.random() * otherRejections.length);
        const selectedOtherRejection = otherRejections[randomOtherIndex];
        
        return [selectedTechRejection, selectedOtherRejection];
      } else {
        // If no other rejections, get another tech rejection if available
        if (techRejections.length > 1) {
          let secondTechIndex = Math.floor(Math.random() * techRejections.length);
          // Make sure we don't pick the same one
          while (secondTechIndex === randomTechIndex) {
            secondTechIndex = Math.floor(Math.random() * techRejections.length);
          }
          return [selectedTechRejection, techRejections[secondTechIndex]];
        } else {
          // Only one tech rejection available
          return [selectedTechRejection];
        }
      }
    } else {
      // No tech rejections, just pick 2 random rejections from the others
      const shuffled = [...otherRejections].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 2);
    }
  }, [formattedNotableRejections]);

  // Log the rejection data for debugging
  useEffect(() => {
    if (scanData) {
      console.log('Dashboard scanData:', scanData);
      console.log('Formatted notable rejections:', formattedNotableRejections);
      console.log('Tech company count:', techCompanyRejectionCount);
      console.log('Random rejections for display:', randomNotableRejections);
    }
  }, [scanData, formattedNotableRejections, randomNotableRejections, techCompanyRejectionCount]);

  useEffect(() => {
    // Perform initial scan only once when component mounts and user is available
    if (user && !initialScanDone && !scanData) {
      performScan();
      fetchQuote();
      setInitialScanDone(true);
    }
  }, [user, performScan, fetchQuote, initialScanDone, scanData]);

  const handleRescan = () => {
    setScanData(null);
    performScan();
    fetchQuote();
  }

  const mostRecentMonthWithRejections = scanData?.rejections_per_month 
    ? Object.keys(scanData.rejections_per_month).sort().pop()
    : null;
  const rejectionsThisMonth = mostRecentMonthWithRejections
    ? scanData?.rejections_per_month[mostRecentMonthWithRejections]
    : 0;

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ my: 3, textAlign: 'center' }}>
          {!scanData && !isScanLoading && !scanError && (
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleRescan} 
              disabled={isScanLoading} 
              sx={{
                mb: 4,
                py: 1.5,
                px: 4,
                borderRadius: '30px',
                fontSize: '1.1rem',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: `0 8px 20px ${theme.palette.error.main}33`
              }}
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isScanLoading ? <CircularProgress size={24} color="inherit"/> : 'Scan My Gmail for Rejections'}
            </Button>
          )}
        </Box>
      </motion.div>

      {isScanLoading && (
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          sx={{ minHeight: '50vh' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                width: { xs: '100%', sm: 500 },
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center',
                mb: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                <EmailIcon sx={{ color: theme.palette.error.main, fontSize: 40, mr: 1 }} />
                <Typography variant="h5" fontWeight={600}>
                  Scanning Inbox
                </Typography>
              </Box>
              
              <CircularProgress 
                color="error"
                size={60}
                thickness={4}
                sx={{ mb: 3 }}
              />
              
              <Typography variant="caption" color="text.secondary">
                Processing emails, identifying rejections, and extracting patterns.
                If you have a lot of emails, this might a while.
              </Typography>
            </Paper>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Typography variant="body2" color="text.secondary">
              We're analyzing your emails using natural language processing to identify rejection patterns.
            </Typography>
          </motion.div>
        </Box>
      )}

      {scanError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert severity="error" sx={{ my: 4, py: 2, borderRadius: 3 }}>
            <Typography gutterBottom><strong>Error during scan:</strong> {scanError}</Typography>
            <Typography>Please ensure you have granted Gmail access and try again. If the problem persists, you may need to re-authenticate.</Typography>
          </Alert>
        </motion.div>
      )}

      {scanData && (
        <Box id={DASHBOARD_CONTENT_ID}> {/* This Box will be targeted for screenshot */} 
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={4}>
              {/* User info for ShareBar extraction - hidden from view */}
              <div style={{ display: 'none' }} data-user="username">
                {user?.name || user?.email || 'Anonymous'}
              </div>
            
              {/* Stats Cards */}
              <Grid item xs={12} sm={6} md={4}>
                <motion.div variants={itemVariants}>
                  <StatsCard 
                    title="Total Rejections" 
                    value={scanData.total_rejections} 
                    icon={<MoodBadIcon />} 
                    color={theme.palette.error.main}
                    description="All rejections found."
                    showAnimatedCounter
                    data-stat="total-rejections"
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <motion.div variants={itemVariants}>
                  <StatsCard 
                    title="Rejections" 
                    value={rejectionsThisMonth || 0} 
                    icon={<TotalIcon />} 
                    description={`In ${mostRecentMonthWithRejections ? new Date(mostRecentMonthWithRejections).toLocaleString('default', { month: 'long', year: 'numeric' }) : 'the most recent period'}`}
                    showAnimatedCounter
                    data-stat="monthly-rejections"
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <motion.div variants={itemVariants}>
                  <StatsCard 
                    title="Notable Rejections" 
                    value={(scanData as any)?.fang_rejection_count ?? 0} 
                    icon={<NotableIcon />} 
                    description="Rejections from major tech companies"
                    color={theme.palette.warning.main}
                    showAnimatedCounter
                  />
                </motion.div>
              </Grid>

              {/* Rejection Chart */}
              <Grid item xs={12} md={8}>
                <motion.div variants={itemVariants}>
                  <RejectionChart data={scanData.rejections_per_month || {}} />
                </motion.div>
              </Grid>

              {/* Hall of Shame List */}
              <Grid item xs={12} md={4}>
                <motion.div variants={itemVariants}>
                  <HallOfShameList 
                    notableRejections={formattedNotableRejections} 
                    maxItems={2}
                    totalCount={formattedNotableRejections.length}
                  />
                </motion.div>
              </Grid>

              {/* Motivational Quote */}
              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 4, 
                      mt: 2, 
                      textAlign: 'center',
                      backgroundColor: 'rgba(248, 249, 250, 0.8)',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Quote of the Session:
                    </Typography>
                    {isQuoteLoading && <CircularProgress size={20} color="error"/>}
                    {quoteError && <Typography color="error">Failed to load quote.</Typography>}
                    {randomQuote && (
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontStyle: 'italic',
                          fontWeight: 400,
                          lineHeight: 1.6,
                          maxWidth: '800px',
                          mx: 'auto',
                          mt: 2
                        }}
                      >
                        "{randomQuote}"
                      </Typography>
                    )}
                  </Paper>
                </motion.div>
              </Grid>
            </Grid>
            <motion.div variants={itemVariants}>
              <ShareBar 
                targetElementId={DASHBOARD_CONTENT_ID} 
                userStats={{
                  username: user?.name || user?.email || 'Anonymous',
                  totalRejections: scanData.total_rejections || 0,
                  monthlyRejections: rejectionsThisMonth || 0,
                  chartDataKey: JSON.stringify(scanData.rejections_per_month || {})
                }}
              />
            </motion.div>
          </motion.div>
        </Box>
      )}
    </Container>
  );
};

export default DashboardPage; 