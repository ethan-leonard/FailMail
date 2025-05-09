import React from 'react';
import { Box, Button, Container, Typography, useTheme, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import GradientText from './GradientText';

interface CTASectionProps {
  onStartScan: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onStartScan }) => {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        py: 10,
        backgroundColor: '#ffffff'
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              textAlign: 'center',
              background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
              border: '1px solid',
              borderColor: 'divider',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Decorative elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #FF4D4D20, #FF4D4D05)',
                zIndex: 0
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #F9CB2820, #F9CB2805)',
                zIndex: 0
              }}
            />

            {/* Content */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" component="h2" fontWeight={700} gutterBottom>
                Ready to <GradientText variant="h3" component="span">embrace</GradientText> rejection?
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
              >
                Start tracking your rejections today and turn them into your success story. 
                It's time to wear your rejections as badges of honor.
              </Typography>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  onClick={onStartScan}
                  sx={{
                    py: 1.5,
                    px: 5,
                    borderRadius: '30px',
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: `0 8px 20px ${theme.palette.error.main}33`
                  }}
                >
                  Start Scan
                </Button>
              </motion.div>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                No credit card required. Only read-only Gmail access needed.
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default CTASection; 