import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  Collapse,
  IconButton,
  Box,
  Chip
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, NewReleases as NewReleasesIcon, ErrorOutline as ErrorOutlineIcon, RecordVoiceOver as RecordVoiceOverIcon } from '@mui/icons-material';

interface SnippetDetail {
  sender: string;
  snippet: string;
  // tags?: string[]; // From backend: FANG, TemplateFail, InterviewStage - could be used for icons/chips
}

interface HallOfShameListProps {
  notableRejections: SnippetDetail[];
}

const getIconForSender = (sender: string) => {
  const lowerSender = sender.toLowerCase();
  if (lowerSender.includes('google') || lowerSender.includes('meta') || lowerSender.includes('amazon') || lowerSender.includes('apple') || lowerSender.includes('microsoft')) {
    return <NewReleasesIcon color="error" sx={{mr:1}}/>; // FANG/Notable
  }
  // Could add more logic for TemplateFail or InterviewStage if tags were passed and processed
  return null;
}

const HallOfShameList: React.FC<HallOfShameListProps> = ({ notableRejections }) => {
  const [open, setOpen] = useState(true); // Default to open

  const handleClick = () => {
    setOpen(!open);
  };

  if (!notableRejections || notableRejections.length === 0) {
    return (
      <Paper className="apple-style-card" sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6">Hall of Shame</Typography>
        <Typography>No particularly notable rejections found (yet!).</Typography>
      </Paper>
    );
  }

  return (
    <Paper className="apple-style-card" sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" onClick={handleClick} sx={{ cursor: 'pointer' }}>
        <Typography variant="h6" component="div">
          Hall of Shame ({notableRejections.length})
        </Typography>
        <IconButton edge="end" aria-label={open ? "collapse" : "expand"}>
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List dense>
          {notableRejections.map((rejection, index) => (
            <ListItem key={index} divider sx={{ alignItems: 'flex-start', flexDirection: 'column' }}>
              <ListItemText
                primaryTypographyProps={{ fontWeight: 'medium' }}
                primary={
                    <Box component="span" display="flex" alignItems="center">
                        {getIconForSender(rejection.sender)}
                        {rejection.sender}
                    </Box>
                }
                secondaryTypographyProps={{ component: 'div' }} 
                secondary={
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mt: 0.5 }}>
                    {rejection.snippet}
                    {/* TODO: Add chips for TemplateFail, InterviewStage if available */}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Paper>
  );
};

export default HallOfShameList; 