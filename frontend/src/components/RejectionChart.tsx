import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface RejectionChartProps {
  data: Record<string, number>;
}

const RejectionChart: React.FC<RejectionChartProps> = ({ data }) => {
  const theme = useTheme();
  const [animatedData, setAnimatedData] = useState<any[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

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

  // Animation for the chart data
  useEffect(() => {
    // Cancel any existing animation when data changes
    setIsAnimating(false);
    setIsInitialLoadComplete(false);
    
    // Only animate if we have data to show
    if (chartData && chartData.length > 0) {
      // Reset animation state
      setIsAnimating(true);
      
      // Create data with zeros for all rejections
      const initialData = chartData.map(item => ({
        ...item,
        rejections: 0
      }));
      
      // Set initial data with zero values first
      setAnimatedData(initialData);

      // Add small delay to ensure initial render happens with zero values
      setTimeout(() => {
        // Animate in each bar one by one
        let currentIndex = 0;
        
        const animationInterval = setInterval(() => {
          if (currentIndex < chartData.length) {
            setAnimatedData(prev => {
              // Create a new copy of the previous data
              const newData = [...prev];
              
              // Safety check to ensure the index exists in both arrays
              if (currentIndex >= 0 && currentIndex < newData.length && 
                  currentIndex < chartData.length) {
                
                // Update the rejection value for this data point
                newData[currentIndex] = {
                  ...newData[currentIndex],
                  rejections: chartData[currentIndex].rejections
                };
              }
              
              return newData;
            });
            
            currentIndex++;
          } else {
            clearInterval(animationInterval);
            setIsAnimating(false);
            setIsInitialLoadComplete(true);
          }
        }, 150); // Time between each bar appearing
        
        return () => {
          clearInterval(animationInterval);
        };
      }, 50); // Small delay to ensure the chart renders with zero values first
    } else {
      // If no data, just reset
      setAnimatedData([]);
      setIsInitialLoadComplete(true);
    }
  }, [chartData]);

  // Use proper data for the chart
  const displayData = useMemo(() => {
    if (chartData.length === 0) return [];
    
    // During animation or after initial load, use the animated data
    if (isAnimating || isInitialLoadComplete) {
      return animatedData.length > 0 ? animatedData : chartData;
    }
    
    // During initial render before animation starts, show zeros
    return chartData.map(item => ({
      ...item,
      rejections: 0
    }));
  }, [chartData, animatedData, isAnimating, isInitialLoadComplete]);

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
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Rejection Trend
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {chartData.length === 0 
            ? "No rejection data available yet." 
            : "Your rejection journey over time. Each application is a step forward."}
        </Typography>
        
        <Box sx={{ height: 300, mt: 2, }}>
          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" className="rejection-chart">
              <BarChart
                data={displayData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 25,
                }}
                style={{ backgroundColor: 'transparent' }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke={'rgba(0, 0, 0, 0.1)'} 
                />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} 
                  tickMargin={10}
                  stroke={'rgba(0, 0, 0, 0.5)'} 
                />
                <YAxis 
                  allowDecimals={false} 
                  tick={{ fontSize: 12 }}
                  stroke={'rgba(0, 0, 0, 0.5)'} 
                  // Set domain to include the max value from chartData even if we're showing zeros
                  domain={[0, 'auto']}
                />
                <Tooltip 
                  formatter={(value) => [`${value} rejections`, 'Count']}
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                  labelStyle={{ 
                    fontWeight: 600, 
                    color: '#2d3748'
                  }}
                />
                <Bar 
                  dataKey="rejections" 
                  fill={theme.palette.error.main} 
                  radius={[4, 4, 0, 0]}
                  animationDuration={500}
                  animationBegin={0}
                  animationEasing="ease-out"
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
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
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