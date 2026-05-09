import { Box, Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import index from '../generated/index.json';
import type { ContentIndex } from '../content';
import { BenchmarkCard } from '../components/BenchmarkCard';
import { SocialLinks } from '../components/SocialLinks';
import { LatestVideo } from '../components/LatestVideo';
import { BrandAvatar } from '../components/BrandAvatar';

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
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 4, md: 6 },
          alignItems: { xs: 'flex-start', md: 'center' },
        }}
      >
        <BrandAvatar
          sx={{
            width: { xs: 120, md: 180 },
            height: { xs: 120, md: 180 },
          }}
        />
        <Box>
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', letterSpacing: 2 }}
          >
            abucnasty
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 700, mt: 1, lineHeight: 1.05 }}>
            Factorio benchmarks,
            <br />
            blueprints, and tools.
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: 'text.secondary', mt: 2, maxWidth: 720, fontWeight: 400 }}
          >
            A home for the UPS research, blueprint registry, and side-projects from{' '}
            <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
              abucnasty
            </Box>
            . Everything here is open source.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mt: 4 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Button
              component={RouterLink}
              to="/benchmarks"
              variant="contained"
              size="large"
            >
              Browse benchmarks
            </Button>
            <Button
              component={RouterLink}
              to="/blueprints"
              variant="outlined"
              size="large"
              color="secondary"
            >
              Blueprints
            </Button>
            <Box sx={{ ml: { sm: 1 } }}>
              <SocialLinks />
            </Box>
          </Stack>
        </Box>
      </Box>

      {featured.length > 0 && (
        <Box>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Featured benchmarks
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

      <LatestVideo />
    </Stack>
  );
}
