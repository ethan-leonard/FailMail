import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  IconButton, 
  Tooltip 
} from '@mui/material';
import { motion } from 'framer-motion';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  color?: string;
  showAnimatedCounter?: boolean;
  'data-stat'?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  description,
  color = '#1976d2',
  showAnimatedCounter = false,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    if (!showAnimatedCounter) {
      setDisplayValue(value);
      return;
    }
    
    // Reset to 0 when value changes
    setDisplayValue(0);
    
    const duration = 1500; // Animation duration in ms
    const steps = 30; // Total steps
    const stepTime = duration / steps;
    const increment = value / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      setDisplayValue(Math.min(Math.ceil(current * increment), value));
      
      if (current >= steps) {
        clearInterval(timer);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [value, showAnimatedCounter]);
  
  return (
    <Card 
      component={motion.div}
      whileHover={{ y: -5, boxShadow: '0 12px 20px rgba(0, 0, 0, 0.08)' }}
      transition={{ duration: 0.3 }}
      sx={{ 
        height: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)'
      }}
      {...props}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {title}
          </Typography>
          
          <Box 
            sx={{ 
              backgroundColor: `${color}22`, 
              color: color,
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
        
        <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
          <Typography 
            variant="h3" 
            fontWeight={700} 
            sx={{ 
              color, 
              display: 'inline-block' 
            }}
          >
            {displayValue.toLocaleString()}
          </Typography>
          
          {description && (
            <Tooltip title={description} arrow>
              <IconButton size="small" sx={{ opacity: 0.7 }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        {description && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard; 