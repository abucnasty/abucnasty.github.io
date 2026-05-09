import { Box, Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import index from '../generated/index.json';
import type { ContentIndex } from '../content';
import { BenchmarkCard } from '../components/BenchmarkCard';

const content = index as ContentIndex;

export function Home() {
  const featured = content.benchmarks.filter((b) => b.featured);
  return (
    <Stack spacing={6}>
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          px: { xs: 3, md: 6 },
          backgroundColor: 'background.paper',
          borderLeft: '6px solid',
          borderColor: 'primary.main',
        }}
      >
        <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 2 }}>
          Factorio Benchmarks
        </Typography>
        <Typography variant="h2" sx={{ fontWeight: 700, mt: 1 }}>
          Performance data for serious factories.
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mt: 2, maxWidth: 720 }}>
          Curated UPS benchmarks, blueprint registry, and tools — all open source.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button component={RouterLink} to="/benchmarks" variant="contained" size="large">
            Browse benchmarks
          </Button>
          <Button component={RouterLink} to="/blueprints" variant="outlined" size="large" color="secondary">
            Blueprints
          </Button>
        </Stack>
      </Box>

      {featured.length > 0 && (
        <Box>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Featured
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            }}
          >
            {featured.map((b) => (
              <BenchmarkCard key={b.slug} benchmark={b} />
            ))}
          </Box>
        </Box>
      )}
    </Stack>
  );
}
