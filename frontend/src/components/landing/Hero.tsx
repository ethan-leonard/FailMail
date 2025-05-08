import React from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Grid, 
  useTheme,
  useMediaQuery 
} from '@mui/material';
import { motion } from 'framer-motion';
import GradientText from './GradientText';
import AnimatedCounter from './AnimatedCounter';

interface HeroProps {
  onStartScan: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartScan }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        pt: { xs: 12, md: 6 },
        pb: 6,
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(180deg, #0a0a0a 0%, #121212 100%)' 
          : 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <Typography 
                  component="h1" 
                  variant="h2" 
                  fontWeight="800" 
                  sx={{ mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem' } }}
                >
                  Turn rejections into 
                  <Box component="span" sx={{ ml: 1 }}>
                    <GradientText variant="h2" fontWeight="800">motivation</GradientText>
                  </Box>
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography 
                  variant="h5" 
                  color="text.secondary" 
                  sx={{ mb: 4, fontWeight: 400 }}
                >
                  Count &amp; visualize your job rejections with a touch of humor.
                  Over <AnimatedCounter value={23000} suffix="+" variant="h5" color="error.main" fontWeight="bold" /> 
                  users tracking their failures.
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  onClick={onStartScan}
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  sx={{
                    py: 1.5,
                    px: 4,
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
              
              <motion.div variants={itemVariants}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  We only scan Gmail with read-only access. Your data never leaves your browser.
                </Typography>
              </motion.div>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              style={{ 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center' 
              }}
            >
              <Box
                component="img"
                src="/illustration-rejection.svg"
                alt="Rejection emails visualization"
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  height: 'auto',
                  filter: 'drop-shadow(0px 8px 24px rgba(0, 0, 0, 0.15))',
                  display: { xs: 'none', md: 'block' }
                }}
              />
              {/* Fallback for small screens */}
              {isMobile && (
                <Box
                  sx={{
                    width: '100%',
                    height: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h5" color="text.secondary">
                    Visualize your rejection journey
                  </Typography>
                </Box>
              )}
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Hero; 