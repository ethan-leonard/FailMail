# Google Analytics Setup for Vite React Project

This project uses Google Analytics to track user interactions. The Google Analytics tag (G-YW1V93FVGB) has been integrated into the application.

## How it Works

The Google Analytics integration consists of three main parts:

1. **Initialization** (in `main.tsx`): The analytics script is automatically added to the document head when the application starts.

2. **Tracking Hook** (`useGoogleAnalytics.ts`): A custom React hook that automatically tracks page views and provides a method to track custom events.

3. **Analytics Utility** (`firebase/analytics.ts`): Contains helper functions for initializing Google Analytics and tracking events.

## Usage

### Tracking Page Views

Page views are automatically tracked whenever the route changes thanks to the `useGoogleAnalytics` hook that monitors route changes.

### Tracking Custom Events

To track custom events in your components:

```jsx
import useGoogleAnalytics from '../hooks/useGoogleAnalytics';

const YourComponent = () => {
  const { trackEvent } = useGoogleAnalytics();

  const handleSomeAction = () => {
    // Track the event with optional parameters
    trackEvent('user_action', { 
      action_type: 'click',
      item_id: '123',
      // Add any other parameters you want to track
    });
    
    // Rest of your code...
  };

  return (
    // Your component JSX
  );
};
```

### Example Component

An example component showing how to use analytics tracking is available at `src/components/AnalyticsExample.tsx`.

## Viewing Analytics Data

To view the collected analytics data:

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with the Google account that has access to the G-YW1V93FVGB property
3. Navigate to the Reports section

## Common Event Types

Consider using these standard event types for consistency:

- `page_view`: Automatically tracked when routes change
- `click`: When a user clicks on an element
- `form_submit`: When a user submits a form
- `login`: When a user logs in
- `sign_up`: When a user registers
- `purchase`: For e-commerce events
- `view_item`: When a user views a specific item or content

## Important Notes

- The initial page load tracking is handled automatically
- Custom events should follow a consistent naming convention
- Event parameters should be descriptive but concise
- Avoid tracking personally identifiable information (PII) 