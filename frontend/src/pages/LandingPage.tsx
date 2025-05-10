import React, { useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Import landing page components
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import VideoSection from '../components/landing/VideoSection';
import FeatureSection from '../components/landing/FeatureSection';
import MemeSection from '../components/landing/MemeSection';
import CTASection from '../components/landing/CTASection';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  // Function to handle the start scan button click
  const handleStartScan = () => {
    navigate('/login');
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        color: theme.palette.text.primary,
        // Add extra padding at the top for the fixed navbar
        pt: 8
      }}
    >
      {/* Navbar */}
      <Navbar onStartScan={handleStartScan} />
      
      {/* Hero Section */}
      <Hero onStartScan={handleStartScan} />
      
      {/* Video Demo Section */}
      <VideoSection />
      
      {/* Feature Section */}
      <FeatureSection />
      
      {/* Meme Section */}
      <MemeSection />
      
      {/* Final CTA Section */}
      <CTASection onStartScan={handleStartScan} />
    </Box>
  );
};

export default LandingPage; 