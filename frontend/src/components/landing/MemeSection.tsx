import React from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import GradientText from './GradientText';

// Individual meme card component
const MemeCard: React.FC<{ text: string; emoji: string; index: number }> = ({ text, emoji, index }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      style={{
        padding: '16px 24px',
        borderRadius: '12px',
        backgroundColor: theme.palette.mode === 'dark' ? '#1E1E1E' : '#ffffff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        margin: '0 16px',
        width: '280px',
        flexShrink: 0,
        border: '1px solid',
        borderColor: theme.palette.divider,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}
    >
      <Box sx={{ fontSize: '3rem', mb: 2 }}>{emoji}</Box>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>{text}</Typography>
    </motion.div>
  );
};

// List of memes
const memes = [
  { text: "When you get 3 rejections in one day", emoji: "😅" },
  { text: "The 'we'll keep your resume on file' email", emoji: "🗄️" },
  { text: "The 'unfortunately' opening line", emoji: "💀" },
  { text: "When they ghost you after 5 interviews", emoji: "👻" },
  { text: "Your first FAANG rejection", emoji: "🍎" },
  { text: "The 'we decided to go in a different direction' email", emoji: "🔄" },
  { text: "Opening LinkedIn to see your competition got hired", emoji: "📱" },
  { text: "When the rejection has typos in it", emoji: "🤦‍♂️" },
];

// Animated marquee component for meme cards
const MemeMarquee: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        overflowX: 'hidden',
        position: 'relative',
        py: 4
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          width: 'fit-content',
        }}
      >
        {memes.map((meme, index) => (
          <MemeCard key={index} text={meme.text} emoji={meme.emoji} index={index} />
        ))}
      </Box>
    </Box>
  );
};

const MemeSection: React.FC = () => {
  return (
    <Box
      component="section"
      sx={{
        py: 8,
        backgroundColor: '#F5F5F7',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <Typography variant="h3" component="h2" fontWeight={700} gutterBottom>
              The <GradientText variant="h3" component="span">rejection meme</GradientText> collection
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                maxWidth: 700, 
                mx: 'auto',
                mb: 2  
              }}
            >
              Because if you can't laugh at rejection, what can you laugh at?
            </Typography>
          </motion.div>
        </Box>
      </Container>

      <MemeMarquee />
    </Box>
  );
};

export default MemeSection; 