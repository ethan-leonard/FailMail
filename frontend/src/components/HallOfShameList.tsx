import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Box,
  useTheme,
  Divider,
  Avatar,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import WorkOffIcon from '@mui/icons-material/WorkOff';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import StarIcon from '@mui/icons-material/Star';
import LoopIcon from '@mui/icons-material/Loop';

interface Rejection {
  company: string;
  position: string;
  date: string;
  reason?: string;
  isTechCompany?: boolean; // Flag for tech company rejections
}

interface HallOfShameListProps {
  notableRejections: Rejection[];
  maxItems?: number;
  totalCount?: number;
}

const HallOfShameList: React.FC<HallOfShameListProps> = ({ 
  notableRejections,
  maxItems = 2, // Default to showing 2 items
  totalCount
}) => {
  const theme = useTheme();
  const [currentRejections, setCurrentRejections] = useState<Rejection[]>([]);
  const [rotationCounter, setRotationCounter] = useState(0);

  // UseEffect for email rotation every 8 seconds
  useEffect(() => {
    // Initialize with default rejections
    setCurrentRejections(notableRejections.slice(0, maxItems));
    
    // Only setup rotation if we have more than maxItems rejections
    if (notableRejections.length > maxItems) {
      const rotationInterval = setInterval(() => {
        setRotationCounter(prev => prev + 1);
      }, 8000);
      
      // Cleanup on unmount
      return () => clearInterval(rotationInterval);
    }
  }, [notableRejections, maxItems]);
  
  // Update displayed rejections when rotation counter changes
  useEffect(() => {
    if (notableRejections.length > maxItems) {
      // Create a new set of rejections to display
      const startIndex = (rotationCounter * maxItems) % notableRejections.length;
      const endIndex = Math.min(startIndex + maxItems, notableRejections.length);
      
      // If we need to wrap around to the beginning of the array
      if (endIndex - startIndex < maxItems) {
        const firstPart = notableRejections.slice(startIndex);
        const secondPart = notableRejections.slice(0, maxItems - (endIndex - startIndex));
        setCurrentRejections([...firstPart, ...secondPart]);
      } else {
        setCurrentRejections(notableRejections.slice(startIndex, endIndex));
      }
    }
  }, [rotationCounter, notableRejections, maxItems]);

  // Ensure we have valid data and limit to maxItems
  const rejections = currentRejections && Array.isArray(currentRejections) 
    ? currentRejections 
    : [];

  // Determine if we're showing a random sample
  const isShowingSample = totalCount !== undefined && totalCount > rejections.length;
  const isRotating = notableRejections.length > maxItems;

  // Animation variants
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  // Function to extract real position from rejection reason/snippet
  const extractPosition = (rejection: Rejection): string => {
    if (rejection.position && rejection.position !== 'Position Not Specified') {
      return rejection.position;
    }
    
    // Try to extract position from the reason text
    if (rejection.reason) {
      // Common patterns in rejection emails
      const positionPatterns = [
        /application for the (.*?) role/i,
        /application for the (.*?) position/i,
        /application for our (.*?) role/i,
        /application for our (.*?) position/i,
        /regarding the (.*?) role/i,
        /regarding the (.*?) position/i,
        /interest in the (.*?) role/i,
        /interest in the (.*?) position/i,
        /the (.*?) opportunity/i,
        /applied for the (.*?) position/i
      ];
      
      for (const pattern of positionPatterns) {
        const match = rejection.reason.match(pattern);
        if (match && match[1]) {
          // Clean up the extracted position
          let position = match[1].trim();
          // Remove any trailing punctuation
          position = position.replace(/[,.;:]$/, '');
          // Return if not too long
          if (position.length < 40) {
            return position;
          }
        }
      }
      
      // If company name is known, try to extract a general role
      if (rejection.company && rejection.company !== 'Unknown Company') {
        const rolePatterns = [
          /software engineer/i,
          /developer/i,
          /programmer/i,
          /data scientist/i,
          /product manager/i,
          /designer/i,
          /ux researcher/i,
          /analyst/i,
          /engineer/i,
          /marketing/i
        ];
        
        for (const pattern of rolePatterns) {
          const match = rejection.reason.match(pattern);
          if (match) {
            return match[0];
          }
        }
      }
    }
    
    // Fallbacks based on company domain
    if (rejection.company) {
      const companyLower = rejection.company.toLowerCase();
      if (companyLower.includes('google') || 
          companyLower.includes('facebook') || 
          companyLower.includes('meta') || 
          companyLower.includes('microsoft') || 
          companyLower.includes('amazon') || 
          companyLower.includes('apple')) {
        return 'Software Engineer';
      }
      
      if (companyLower.includes('data') || companyLower.includes('analytics')) {
        return 'Data Scientist';
      }
      
      if (companyLower.includes('design') || companyLower.includes('ux')) {
        return 'UX Designer';
      }
    }
    
    return 'Software Developer'; // Default fallback
  };

  // Function to generate initials for the avatar
  const getCompanyInitials = (company: string | undefined): string => {
    if (!company) return 'XX'; // Default for unknown companies

    return company
      .split(/\s+/)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Function to generate a consistent color for a company
  const getAvatarColor = (company: string | undefined, isTechCompany: boolean = false): string => {
    // Always use gold color for tech companies
    if (isTechCompany) {
      return theme.palette.warning.main;
    }
    
    const colors = [
      theme.palette.error.main,
      theme.palette.info.main,
      '#9C27B0', // purple
      '#2196F3', // blue
      '#009688', // teal
    ];
    
    // If no company name, return the first color
    if (!company) return colors[0];
    
    // Simple hash function to get a stable color for a company name
    const hash = company.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Format date function that handles string or Date objects
  const formatDate = (dateInput: string | undefined): string => {
    if (!dateInput) return 'Unknown Date';
    
    try {
      const date = new Date(dateInput);
      return date.toLocaleDateString();
    } catch (e) {
      return dateInput || 'Unknown Date';
    }
  };

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
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
          <WorkOffIcon sx={{ mr: 1, color: theme.palette.error.main }} />
          <Typography variant="h6" fontWeight={600}>
            Rejection Collection
          </Typography>
        </Box>

        <Box mb={2} pt={2} display="flex" alignItems="center" gap={1}>
          {isShowingSample && (
            <Chip
              icon={<ShuffleIcon />}
              label={`Showing ${rejections.length} of ${totalCount} total`}
              size="small"
              variant="outlined"
              color="warning"
              sx={{ borderRadius: '12px' }}
            />
          )}
          
          {isRotating && (
            <Chip
              icon={<LoopIcon />}
              label="Auto-rotating"
              size="small"
              variant="outlined"
              color="info"
              sx={{ borderRadius: '12px' }}
            />
          )}
        </Box>

        {rejections.length > 0 ? (
          <motion.div
            key={`rejections-${rotationCounter}`}
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <List disablePadding>
              {rejections.map((rejection, index) => (
                <React.Fragment key={`${rejection.company || 'unknown'}-${index}-${rotationCounter}`}>
                  {index > 0 && <Divider component="li" variant="inset" sx={{ ml: 0 }} />}
                  <motion.div variants={itemVariants}>
                    <ListItem 
                      alignItems="flex-start" 
                      sx={{ 
                        py: 1.5,
                        px: 0,
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Avatar 
                          sx={{ 
                            backgroundColor: getAvatarColor(rejection.company, rejection.isTechCompany),
                            width: 32,
                            height: 32,
                            fontSize: '0.875rem'
                          }}
                        >
                          {getCompanyInitials(rejection.company)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography component="span" variant="subtitle2" fontWeight={600}>
                              {rejection.company || 'Unknown Company'}
                            </Typography>
                            {rejection.isTechCompany && (
                              <StarIcon 
                                fontSize="small" 
                                sx={{ 
                                  ml: 0.5, 
                                  color: theme.palette.warning.main,
                                  width: 16,
                                  height: 16
                                }} 
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.secondary" display="block">
                              {extractPosition(rejection)}
                            </Typography>
                            <Typography component="span" variant="caption" color="text.secondary">
                              {formatDate(rejection.date)}
                              {rejection.reason && ` • ${rejection.reason.substring(0, 110)}${rejection.reason.length > 110 ? '...' : ''}`}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  </motion.div>
                </React.Fragment>
              ))}
            </List>
          </motion.div>
        ) : (
          <Box 
            sx={{ 
              height: 200, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
              borderRadius: 2
            }}
          >
            <Typography color="text.secondary" fontStyle="italic">
              No notable rejections yet. Keep applying!
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default HallOfShameList; 