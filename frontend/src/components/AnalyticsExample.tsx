import React from 'react';
import useGoogleAnalytics from '../hooks/useGoogleAnalytics';
import { Button } from '@mui/material';

const AnalyticsExample: React.FC = () => {
  const { trackEvent } = useGoogleAnalytics();

  const handleButtonClick = () => {
    // Track a custom event when the button is clicked
    trackEvent('button_click', { 
      button_name: 'example_button',
      button_location: 'example_component'
    });
    
    alert('Event tracked in Google Analytics!');
  };

  return (
    <div>
      <h2>Google Analytics Example</h2>
      <p>Click the button below to trigger a custom event in Google Analytics</p>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleButtonClick}
      >
        Track Event
      </Button>
    </div>
  );
};

export default AnalyticsExample; 