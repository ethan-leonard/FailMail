import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackEvent } from '../firebase/analytics';

/**
 * Hook to use Google Analytics in React components
 */
const useGoogleAnalytics = () => {
  const location = useLocation();

  // Track page views when the route changes
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return { trackEvent };
};

export default useGoogleAnalytics; 