import React from 'react';
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
  const isDarkMode = theme.palette.mode === 'dark';

  // Ensure we have valid data and limit to maxItems
  const rejections = notableRejections && Array.isArray(notableRejections) 
    ? notableRejections.slice(0, maxItems) 
    : [];

  // Determine if we're showing a random sample
  const isShowingSample = totalCount !== undefined && totalCount > rejections.length;

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
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(145deg, #1e1e1e 0%, #121212 100%)' 
          : 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
          <WorkOffIcon sx={{ mr: 1, color: theme.palette.error.main }} />
          <Typography variant="h6" fontWeight={600}>
            Notable Rejections
          </Typography>
        </Box>

        {isShowingSample && (
          <Box mb={2} display="flex" alignItems="center">
            <Chip
              icon={<ShuffleIcon />}
              label={`Showing ${rejections.length} random of ${totalCount} total`}
              size="small"
              variant="outlined"
              color="warning"
              sx={{ borderRadius: '12px' }}
            />
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" paragraph>
          {rejections.length > 0 
            ? "The hall of fame of rejections." 
            : "No notable rejections found yet. Keep applying!"}
        </Typography>

        {rejections.length > 0 ? (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <List disablePadding>
              {rejections.map((rejection, index) => (
                <React.Fragment key={`${rejection.company || 'unknown'}-${index}`}>
                  {index > 0 && <Divider component="li" variant="inset" sx={{ ml: 0 }} />}
                  <motion.div variants={itemVariants}>
                    <ListItem 
                      alignItems="flex-start" 
                      sx={{ 
                        py: 1.5,
                        px: 0,
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
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
                              {rejection.position || 'Unknown Position'}
                            </Typography>
                            <Typography component="span" variant="caption" color="text.secondary">
                              {formatDate(rejection.date)}
                              {rejection.reason && ` • ${rejection.reason}`}
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
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
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