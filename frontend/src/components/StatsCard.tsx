import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  useTheme 
} from '@mui/material';
import { motion } from 'framer-motion';
import AnimatedCounter from './landing/AnimatedCounter';

interface StatsCardProps {
  title: string;
  value: number;
  description?: string;
  icon: React.ReactNode;
  color?: string;
  showAnimatedCounter?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  color, 
  showAnimatedCounter = false
}) => {
  const theme = useTheme();
  const defaultColor = theme.palette.primary.main;
  const cardColor = color || defaultColor;

  return (
    <Card 
      component={motion.div}
      whileHover={{ y: -8, boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)' }}
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
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center">
          {/* Icon */}
          <Box 
            sx={{ 
              mr: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 50,
              height: 50,
              borderRadius: '12px',
              backgroundColor: `${cardColor}15`, // 15% opacity of the color
              color: cardColor
            }}
          >
            {icon}
          </Box>
          
          {/* Title */}
          <Typography variant="h6" fontWeight={600} gutterBottom={false}>
            {title}
          </Typography>
        </Box>
        
        {/* Value */}
        <Box sx={{ my: 2 }}>
          {showAnimatedCounter ? (
            <AnimatedCounter 
              value={value} 
              variant="h3" 
              fontWeight={700} 
              sx={{ color: cardColor }}
            />
          ) : (
            <Typography variant="h3" fontWeight={700} sx={{ color: cardColor }}>
              {value}
            </Typography>
          )}
        </Box>
        
        {/* Description */}
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard; 