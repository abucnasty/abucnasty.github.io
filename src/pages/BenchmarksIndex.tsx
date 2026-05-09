import { Stack, Typography } from '@mui/material';

export function BenchmarksIndex() {
  return (
    <Stack spacing={2}>
      <Typography variant="h3">Benchmarks</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        Benchmark grid will populate from the curated manifest in Phase 2.
      </Typography>
    </Stack>
  );
}
