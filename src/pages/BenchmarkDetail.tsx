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
import { PageHeader } from '../components/PageHeader';
import { layout } from '../layout';
import { formatPlatform } from '../format';
import { saveFolderRoute } from '../saves';

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
        gap: 3,
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 260px' },
        alignItems: 'flex-start',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ mb: hasTabs ? 2 : 3 }}>
          <PageHeader overline={benchmark.date ?? 'Benchmark'} title={benchmark.title} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {benchmark.factorioVersion && (
              <Chip size="small" variant="outlined" label={`Factorio ${benchmark.factorioVersion}`} />
            )}
            {benchmark.platform && (
              <Chip size="small" variant="outlined" label={formatPlatform(benchmark.platform)} />
            )}
            {hasSaves && (
              <Chip
                size="small"
                variant="outlined"
                component={RouterLink}
                to={saveFolderRoute(benchmark.source)}
                clickable
                label={`${benchmark.saves.length} save files`}
              />
            )}
            {hasCharts && (
              <Chip
                size="small"
                variant="outlined"
                clickable
                onClick={() => setTab('charts')}
                label="Interactive charts"
              />
            )}
            {benchmark.tags?.map((t) => (
              <Chip key={t} label={t} size="small" variant="outlined" />
            ))}
          </Box>
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
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                      File sizes, sub-folders and copyable links are in the{' '}
                      <Link component={RouterLink} to={saveFolderRoute(benchmark.source)}>
                        save browser
                      </Link>
                      .
                    </Typography>
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
          top: { md: layout.topBarHeight + 24 },
          backgroundColor: 'background.paper',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
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
