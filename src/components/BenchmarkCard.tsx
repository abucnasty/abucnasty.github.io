import { Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { BenchmarkEntry } from '../content';

interface BenchmarkCardProps {
  benchmark: BenchmarkEntry;
}

export function BenchmarkCard({ benchmark }: BenchmarkCardProps) {
  return (
    <Card sx={{ height: '100%', display: 'flex', backgroundColor: 'background.paper' }}>
      <CardActionArea
        component={RouterLink}
        to={`/benchmarks/${benchmark.slug}`}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <Box sx={{ height: 4, backgroundColor: 'primary.main' }} />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {benchmark.date && (
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              {benchmark.date}
            </Typography>
          )}
          <Typography variant="h6" sx={{ mt: 0.5, mb: 1 }}>
            {benchmark.title}
          </Typography>
          {benchmark.summary && (
            <Typography variant="body2" sx={{ color: 'text.secondary', flexGrow: 1 }}>
              {benchmark.summary}
            </Typography>
          )}
          {benchmark.tags && benchmark.tags.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
              {benchmark.tags.map((t) => (
                <Chip key={t} label={t} size="small" variant="outlined" />
              ))}
            </Stack>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
