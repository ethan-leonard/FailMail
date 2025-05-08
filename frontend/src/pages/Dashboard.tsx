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
import AnimatedCounter from '../components/landing/AnimatedCounter';

// Icons for cards
import TotalIcon from '@mui/icons-material/Summarize'; // Example icon for total rejections
import NotableIcon from '@mui/icons-material/StarBorder'; // Example icon for notable rejections
import MoodBadIcon from '@mui/icons-material/MoodBad'; // Generic rejection icon

// Import interface to match updated Rejection type
interface Rejection {
  company: string;
  position: string;
  date: string;
  reason?: string;
  isTechCompany?: boolean;
}

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
  const { quote: randomQuote, isLoading: isQuoteLoading, error: quoteError, fetchQuote } = useRandomQuote(false); // Fetch on demand
  const [initialScanDone, setInitialScanDone] = useState(false);
  const theme = useTheme();

  // Transform the notable_rejections data to match the expected format
  const formattedNotableRejections = useMemo(() => {
    if (!scanData?.notable_rejections || !Array.isArray(scanData.notable_rejections)) {
      return [];
    }
    
    return scanData.notable_rejections.map((item: SnippetDetail) => ({
      company: item.sender || 'Unknown Company',
      position: 'Position Not Specified',
      date: new Date().toISOString(), // Use current date as fallback
      reason: item.snippet || 'No details available',
      isTechCompany: item.isTechCompany || false // Pass through the tech company flag
    }));
  }, [scanData?.notable_rejections]);

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
      fetchQuote(); // Fetch quote alongside first scan
      setInitialScanDone(true);
    }
  }, [user, performScan, fetchQuote, initialScanDone, scanData]);

  const handleRescan = () => {
    setScanData(null); // Clear old data
    performScan();
    fetchQuote(); // Refresh quote on rescan too
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
          {user && (
            <Typography 
              variant="h4" 
              gutterBottom 
              component="h1" 
              fontWeight={700}
              sx={{ mb: 3 }}
            >
              Welcome back, {user.name || user.email}!
            </Typography>
          )}
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
          {scanData && (
            <Button 
              variant="outlined" 
              color="error" 
              onClick={handleRescan} 
              disabled={isScanLoading} 
              sx={{
                mb: 4,
                py: 1,
                px: 3,
                borderRadius: '24px',
                textTransform: 'none',
                fontWeight: 600
              }}
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isScanLoading ? <CircularProgress size={24} color="inherit"/> : 'Re-Scan Now'}
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
            <CircularProgress size={60} color="error" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Typography variant="h6" sx={{ mt: 3 }}>
              Scanning your inbox... this might take a moment.
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
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <motion.div variants={itemVariants}>
                  <StatsCard 
                    title="Notable Rejections" 
                    value={scanData.notable_rejections?.length || 0} 
                    icon={<NotableIcon />} 
                    description={`Including ${techCompanyRejectionCount} from major tech companies.`}
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
                    notableRejections={randomNotableRejections} 
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
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(248, 249, 250, 0.8)',
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
              <ShareBar targetElementId={DASHBOARD_CONTENT_ID} />
            </motion.div>
          </motion.div>
        </Box>
      )}
    </Container>
  );
};

export default DashboardPage; 