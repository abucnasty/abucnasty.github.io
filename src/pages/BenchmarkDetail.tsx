import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Link,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import DownloadIcon from '@mui/icons-material/Download';
import index from '../generated/index.json';
import type { ContentIndex } from '../content';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { BenchmarkCharts } from '../components/BenchmarkCharts';
import { TableOfContents } from '../components/TableOfContents';

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
  const hasCharts = Boolean(benchmark?.timeseries);
  const hasSaves = (benchmark?.saves.length ?? 0) > 0;
  const hasTabs = hasCharts || hasSaves;
  const [tab, setTab] = useState<'readme' | 'charts' | 'saves'>('readme');

  useEffect(() => {
    setTab('readme');
  }, [hasTabs, slug]);

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
      .then((md) => setMarkdown(md.replace(/^\s*#\s+.*\r?\n+/, '')))
      .catch((e) => setError(String(e)));
  }, [benchmark]);

  if (!benchmark) {
    return (
      <Stack spacing={2}>
        <Typography variant="h3">Not found</Typography>
        <Typography>No benchmark with slug "{slug}".</Typography>
        <Button component={RouterLink} to="/benchmarks" variant="contained">
          Back to benchmarks
        </Button>
      </Stack>
    );
  }

  const showToc = markdown && (tab === 'readme' || !hasTabs);

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
        <Box sx={{ mb: hasTabs ? 2 : 3 }}>
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', letterSpacing: 2, display: 'block' }}
          >
            {benchmark.date ?? 'Benchmark'}
          </Typography>
          <Typography variant="h3" sx={{ mt: 0.5, lineHeight: 1.15 }}>
            {benchmark.title}
          </Typography>
        </Box>
        {hasTabs ? (
          <>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                mb: 3,
                borderBottom: 1,
                borderColor: 'divider',
                minHeight: 40,
                '& .MuiTab-root': { minHeight: 40, textTransform: 'none' },
              }}
            >
              <Tab value="readme" label="README" />
              {hasCharts && <Tab value="charts" label="Interactive metrics" />}
              {hasSaves && <Tab value="saves" label="Save files" />}
            </Tabs>
            {hasCharts && (
              <Box hidden={tab !== 'charts'}>
                {tab === 'charts' && <BenchmarkCharts slug={benchmark.slug} />}
              </Box>
            )}
            {hasSaves && (
              <Box hidden={tab !== 'saves'}>
                {tab === 'saves' && (
                  <Stack spacing={0.5}>
                    {benchmark.saves.map((s) => (
                      <Link
                        key={s.path}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 14, wordBreak: 'break-all' }}
                      >
                        <DownloadIcon fontSize="small" />
                        {s.name}
                      </Link>
                    ))}
                  </Stack>
                )}
              </Box>
            )}
            <Box hidden={tab !== 'readme'}>
              {tab === 'readme' && (
                <>
                  {!markdown && !error && <CircularProgress />}
                  {markdown && <MarkdownRenderer source={markdown} />}
                </>
              )}
            </Box>
          </>
        ) : (
          <>
            {!markdown && !error && <CircularProgress />}
            {markdown && <MarkdownRenderer source={markdown} />}
          </>
        )}
      </Box>

      <Box
        sx={{
          position: { md: 'sticky' },
          top: { md: 88 },
          backgroundColor: 'background.paper',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
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

        {showToc && (
          <>
            <Divider sx={{ my: 2 }} />
            <TableOfContents markdown={markdown} />
          </>
        )}
      </Box>
    </Box>
  );
}
