// Define types for the gtag function

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize gtag
export const initGoogleAnalytics = (measurementId: string) => {
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  
  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  
  document.head.appendChild(script1);
  document.head.appendChild(script2);
};

// Track page views
export const trackPageView = (pagePath: string) => {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
    });
  }
};

// Track custom events
export const trackEvent = (eventName: string, eventParams = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

export default {
  initGoogleAnalytics,
  trackPageView,
  trackEvent
}; 