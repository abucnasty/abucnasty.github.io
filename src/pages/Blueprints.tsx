import { Stack, Typography } from '@mui/material';

export function Blueprints() {
  return (
    <Stack spacing={2}>
      <Typography variant="h3">Blueprints</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        Blueprint registry will be parsed from factorio-benchmarks docs in Phase 3.
      </Typography>
    </Stack>
  );
}
