import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import GradientText from './GradientText';

const VideoSection: React.FC = () => {

  return (
    <Box
      component="section"
      sx={{
        pt: { xs: 0, md: 2 },
        pb: { xs: 8, md: 10 },
        backgroundColor: '#ffffff',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        {/* Section Title */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            mb: 6 
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <Typography variant="h3" component="h2" gutterBottom fontWeight={700}>
              See <GradientText variant="h3" component="span">FailMail</GradientText> in Action
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Watch how easy it is to track, organize, and learn from your job rejections
            </Typography>
          </motion.div>
        </Box>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Paper
            elevation={0}
            sx={{
              maxWidth: '900px',
              mx: 'auto',
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
            }}
          >
            <Box 
              sx={{
                position: 'relative',
                paddingTop: '56.25%', // 16:9 aspect ratio
                backgroundColor: 'black',
              }}
            >
              <Box
                component="video"
                src="/failmail.pro-demo.mp4"
                autoPlay
                muted
                loop
                playsInline
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  pointerEvents: 'none', // Disable any mouse interaction
                }}
              />
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default VideoSection; 