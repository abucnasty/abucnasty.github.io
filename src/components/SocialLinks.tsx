import { Box, IconButton, Tooltip } from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import ChatIcon from '@mui/icons-material/Chat';
import EmailIcon from '@mui/icons-material/Email';

export const socials = {
  youtube: 'https://www.youtube.com/@abucnasty',
  discord: 'https://discord.gg/cffHFas55p',
  email: 'mailto:abucnasty@gmail.com',
};

export function SocialLinks() {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Tooltip title="YouTube">
        <IconButton
          component="a"
          href={socials.youtube}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
          sx={{ color: 'text.primary', '&:hover': { color: 'primary.main' } }}
        >
          <YouTubeIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Discord">
        <IconButton
          component="a"
          href={socials.discord}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Discord"
          sx={{ color: 'text.primary', '&:hover': { color: 'primary.main' } }}
        >
          <ChatIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Business email">
        <IconButton
          component="a"
          href={socials.email}
          aria-label="Email"
          sx={{ color: 'text.primary', '&:hover': { color: 'primary.main' } }}
        >
          <EmailIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
