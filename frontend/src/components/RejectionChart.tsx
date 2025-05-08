import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface RejectionChartProps {
  data: Record<string, number>;
}

const RejectionChart: React.FC<RejectionChartProps> = ({ data }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!data || Object.keys(data).length === 0) {
      return [];
    }
    
    return Object.entries(data)
      .map(([month, count]) => {
        // Format date from YYYY-MM to MMM YY
        try {
          const date = new Date(month);
          const formattedMonth = date.toLocaleString('default', { month: 'short', year: '2-digit' });
          return {
            name: formattedMonth,
            rejections: count,
            month
          };
        } catch (e) {
          // Handle malformed date
          return {
            name: month,
            rejections: count,
            month
          };
        }
      })
      .sort((a, b) => a.month.localeCompare(b.month))
      // Only show the most recent 12 months for better visualization
      .slice(-12);
  }, [data]);

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
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Rejection Trend
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {chartData.length === 0 
            ? "No rejection data available yet." 
            : "Your rejection journey over time. Each application is a step forward."}
        </Typography>
        
        <Box sx={{ height: 300, mt: 2 }}>
          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 25,
                }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} 
                />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} 
                  tickMargin={10}
                  stroke={isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'} 
                />
                <YAxis 
                  allowDecimals={false} 
                  tick={{ fontSize: 12 }}
                  stroke={isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'} 
                />
                <Tooltip 
                  formatter={(value) => [`${value} rejections`, 'Count']}
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
                    borderColor: isDarkMode ? '#4a5568' : '#e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                  labelStyle={{ 
                    fontWeight: 600, 
                    color: isDarkMode ? '#f7fafc' : '#2d3748'
                  }}
                />
                <Bar 
                  dataKey="rejections" 
                  fill={theme.palette.error.main} 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Box 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: 2
              }}
            >
              <Typography color="text.secondary" fontStyle="italic">
                No chart data available. Start scanning to see your rejection journey.
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RejectionChart; 