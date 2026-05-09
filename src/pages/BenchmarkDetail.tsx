import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, Divider, Link, Stack, Typography } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import DownloadIcon from '@mui/icons-material/Download';
import index from '../generated/index.json';
import type { ContentIndex } from '../content';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

const content = index as ContentIndex;

// Eagerly map slugs → raw markdown loaders. Vite resolves these at build time.
const readmeModules = import.meta.glob('../generated/benchmarks/*/README.md', {
  query: '?raw',
  import: 'default',
});

function loaderFor(slug: string): (() => Promise<string>) | undefined {
  const key = `../generated/benchmarks/${slug}/README.md`;
  const loader = readmeModules[key];
  return loader as (() => Promise<string>) | undefined;
}

export function BenchmarkDetail() {
  const { slug = '' } = useParams();
  const benchmark = content.benchmarks.find((b) => b.slug === slug);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMarkdown(null);
    setError(null);
    if (!benchmark) return;
    const loader = loaderFor(benchmark.slug);
    if (!loader) {
      setError('README content not found for this benchmark.');
      return;
    }
    loader()
      .then(setMarkdown)
      .catch((e) => setError(String(e)));
  }, [benchmark]);

  if (!benchmark) {
    return (
      <Stack spacing={2}>
        <Typography variant="h3">Not found</Typography>
        <Typography>No benchmark with slug “{slug}”.</Typography>
        <Button component={RouterLink} to="/benchmarks" variant="contained">
          Back to benchmarks
        </Button>
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 4,
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 280px' },
        alignItems: 'flex-start',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {!markdown && !error && <CircularProgress />}
        {markdown && <MarkdownRenderer source={markdown} />}
      </Box>

      <Box
        sx={{
          position: { md: 'sticky' },
          top: { md: 88 },
          backgroundColor: 'background.paper',
          p: 3,
        }}
      >
        <Typography variant="overline" sx={{ color: 'primary.main' }}>
          {benchmark.date ?? 'Benchmark'}
        </Typography>
        <Typography variant="h6" sx={{ mt: 0.5, mb: 2 }}>
          {benchmark.title}
        </Typography>
        {benchmark.tags && benchmark.tags.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {benchmark.tags.map((t) => (
              <Chip key={t} label={t} size="small" variant="outlined" />
            ))}
          </Stack>
        )}
        <Button
          component="a"
          href={benchmark.readmeGithubUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          size="small"
          fullWidth
          startIcon={<GitHubIcon />}
          sx={{ mb: 1 }}
        >
          View on GitHub
        </Button>

        {benchmark.saves.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Save files ({benchmark.saves.length})
            </Typography>
            <Stack spacing={0.5}>
              {benchmark.saves.map((s) => (
                <Link
                  key={s.path}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 14, wordBreak: 'break-all' }}
                >
                  <DownloadIcon fontSize="small" />
                  {s.name}
                </Link>
              ))}
            </Stack>
          </>
        )}
      </Box>
    </Box>
  );
}
