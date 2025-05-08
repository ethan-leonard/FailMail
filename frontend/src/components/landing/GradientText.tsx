import React from 'react';
import { Typography, TypographyProps } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';

interface GradientTextProps extends TypographyProps {
  gradient?: string;
  animate?: boolean;
}

const StyledTypography = styled(Typography)<{ gradient: string }>(({ gradient }) => ({
  background: gradient,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent',
  display: 'inline-block',
}));

const GradientText: React.FC<GradientTextProps> = ({
  children,
  gradient = 'linear-gradient(90deg, #FF4D4D 0%, #F9CB28 100%)',
  animate = false,
  ...props
}) => {
  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <StyledTypography gradient={gradient} {...props}>
          {children}
        </StyledTypography>
      </motion.div>
    );
  }

  return (
    <StyledTypography gradient={gradient} {...props}>
      {children}
    </StyledTypography>
  );
};

export default GradientText; 