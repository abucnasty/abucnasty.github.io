import { Stack, Typography } from '@mui/material';
import { SocialLinks } from '../components/SocialLinks';

export function About() {
  return (
    <Stack spacing={3}>
      <Typography variant="h3">About</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 720 }}>
        This site hosts Factorio benchmarks, blueprints, and tools published by abucnasty.
        Source: <a href="https://github.com/abucnasty/factorio-benchmarks" target="_blank" rel="noopener noreferrer">factorio-benchmarks</a>.
      </Typography>
      <SocialLinks />
    </Stack>
  );
}
