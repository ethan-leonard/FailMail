import React from 'react';
import { Card, CardContent, Typography, Box, SvgIconTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactElement; // Allow any React element for icon, e.g., <AbcIcon />
  description?: string;
  color?: string; // Optional color for icon/value
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, description, color }) => {
  return (
    <Card className="apple-style-card" sx={{ height: '100%' /* Ensure cards in a grid have same height */ }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          {icon && (
            <Box component="span" mr={1.5} sx={{ color: color || 'primary.main' }}>
              {React.cloneElement(icon, { fontSize: "large" })}
            </Box>
          )}
          <Typography variant="h6" component="div" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" component="p" gutterBottom sx={{ color: color || 'text.primary'}}>
          {value}
        </Typography>
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