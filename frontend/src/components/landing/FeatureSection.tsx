import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import GradientText from './GradientText';

// Icons
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SecurityIcon from '@mui/icons-material/Security';

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay?: number;
}

const Feature: React.FC<FeatureProps> = ({ title, description, icon, delay = 0 }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.6)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <Box sx={{ 
          color: 'error.main', 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 2, 
          fontSize: '3rem' 
        }}>
          {icon}
        </Box>
        <Typography variant="h5" component="h3" align="center" gutterBottom fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ flex: 1 }}>
          {description}
        </Typography>
      </Paper>
    </motion.div>
  );
};

const FeatureSection: React.FC = () => {
  return (
    <Box 
      component="section" 
      sx={{ 
        py: 10,
        backgroundColor: theme => theme.palette.mode === 'dark' ? '#0a0a0a' : '#f8f9fa',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <Typography variant="h3" component="h2" gutterBottom fontWeight={700}>
              Why track <GradientText variant="h3" component="span">rejections</GradientText>?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Because every "no" is one step closer to a "yes" — with data to prove it.
            </Typography>
          </motion.div>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Feature
              title="Track Rejections"
              description="Automatically find and count all those 'unfortunately' emails hiding in your inbox."
              icon={<SentimentVeryDissatisfiedIcon fontSize="inherit" />}
              delay={0.2}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Feature
              title="Visualize Progress"
              description="Beautiful charts and stats to reframe your rejections as steps on your journey."
              icon={<AnalyticsIcon fontSize="inherit" />}
              delay={0.4}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Feature
              title="Private & Secure"
              description="Your email data never leaves your browser. We use OAuth for secure, temporary access."
              icon={<SecurityIcon fontSize="inherit" />}
              delay={0.6}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default FeatureSection; 