import React, { useEffect, useState } from 'react';
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
import StatsCard from '../components/StatsCard';
import RejectionChart from '../components/RejectionChart';
import HallOfShameList from '../components/HallOfShameList';
import ShareBar from '../components/ShareBar';

// Icons for cards
import TotalIcon from '@mui/icons-material/Summarize'; // Example icon for total rejections
import NotableIcon from '@mui/icons-material/StarBorder'; // Example icon for notable rejections
import MoodBadIcon from '@mui/icons-material/MoodBad'; // Generic rejection icon

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

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 2, textAlign: 'center' }}>
        {user && (
          <Typography variant="h5" gutterBottom>
            Welcome back, {user.name || user.email}!
          </Typography>
        )}
        {!scanData && !isScanLoading && !scanError && (
             <Button variant="contained" color="primary" onClick={handleRescan} disabled={isScanLoading} sx={{mb: 2}}>
                {isScanLoading ? <CircularProgress size={24} color="inherit"/> : 'Scan My Gmail for Rejections'}
            </Button>
        )}
        {scanData && (
             <Button variant="outlined" color="secondary" onClick={handleRescan} disabled={isScanLoading} sx={{mb: 2}}>
                {isScanLoading ? <CircularProgress size={24} color="inherit"/> : 'Re-Scan Now'}
            </Button>
        )}
      </Box>

      {isScanLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: '50vh' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>Scanning your inbox... this might take a moment.</Typography>
        </Box>
      )}

      {scanError && (
        <Alert severity="error" sx={{ my: 2 }}>
          <Typography gutterBottom><strong>Error during scan:</strong> {scanError}</Typography>
          <Typography>Please ensure you have granted Gmail access and try again. If the problem persists, you may need to re-authenticate.</Typography>
        </Alert>
      )}

      {scanData && (
        <Box id={DASHBOARD_CONTENT_ID}> {/* This Box will be targeted for screenshot */} 
          <Grid container spacing={3}>
            {/* Stats Cards */}
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard 
                title="Total Rejections" 
                value={scanData.total_rejections} 
                icon={<MoodBadIcon />} 
                color={theme.palette.error.main}
                description="All rejections found."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard 
                title="Rejections (Recent Month)" 
                value={rejectionsThisMonth || 0} 
                icon={<TotalIcon />} 
                description={`In ${mostRecentMonthWithRejections ? new Date(mostRecentMonthWithRejections).toLocaleString('default', { month: 'long', year: 'numeric' }) : 'the most recent period'}`}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard 
                title="Notable Rejections" 
                value={scanData.notable_rejections.length} 
                icon={<NotableIcon />} 
                description="FANG, template fails, or post-interview."
                color={theme.palette.warning.main}
              />
            </Grid>

            {/* Rejection Chart */}
            <Grid item xs={12} md={8}>
              <RejectionChart data={scanData.rejections_per_month} />
            </Grid>

            {/* Hall of Shame List */}
            <Grid item xs={12} md={4}>
              <HallOfShameList notableRejections={scanData.notable_rejections} />
            </Grid>

            {/* Motivational Quote */}
            <Grid item xs={12}>
                <Paper className="apple-style-card" sx={{ p: 2, mt: 2, textAlign: 'center', backgroundColor: theme.palette.mode === 'dark' ? '#2d3748' : '#e2e8f0' }}>
                    <Typography variant="h6" gutterBottom>Quote of the Session:</Typography>
                    {isQuoteLoading && <CircularProgress size={20}/>}
                    {quoteError && <Typography color="error">Failed to load quote.</Typography>}
                    {randomQuote && <Typography variant="subtitle1" sx={{ fontStyle: 'italic' }}>"{randomQuote}"</Typography>}
                </Paper>
            </Grid>
          </Grid>
          <ShareBar targetElementId={DASHBOARD_CONTENT_ID} />
        </Box>
      )}
    </Container>
  );
};

export default DashboardPage; 