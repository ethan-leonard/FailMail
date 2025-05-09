import React, { useEffect, useState } from 'react';
import { useMotionValue, useTransform, animate, useMotionValueEvent } from 'framer-motion';
import { Typography, Box, TypographyProps } from '@mui/material';

interface AnimatedCounterProps extends Omit<TypographyProps, 'children'> {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2,
  prefix = '',
  suffix = '',
  ...props
}) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  // Use motion value event to update the state when the motion value changes
  useMotionValueEvent(rounded, "change", (latest) => {
    setDisplayValue(latest);
  });

  useEffect(() => {
    const controls = animate(count, value, { duration });
    return controls.stop;
  }, [count, value, duration]);

  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
      {prefix && <Typography component="span" {...props}>{prefix}</Typography>}
      <Typography component="span" {...props}>
        {displayValue}
      </Typography>
      {suffix && <Typography component="span" {...props}>{suffix}</Typography>}
    </Box>
  );
};

export default AnimatedCounter; 