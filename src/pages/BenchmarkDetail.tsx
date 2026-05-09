import { Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

export function BenchmarkDetail() {
  const { slug } = useParams();
  return (
    <Stack spacing={2}>
      <Typography variant="overline" sx={{ color: 'primary.main' }}>
        Benchmark
      </Typography>
      <Typography variant="h3">{slug}</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        Markdown rendering wires up in Phase 3.
      </Typography>
    </Stack>
  );
}
