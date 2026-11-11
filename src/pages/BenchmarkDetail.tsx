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

// The question and answer lifted out of the README by the sync. A missing key means no such file.
const questionModules = import.meta.glob('../generated/benchmarks/*/question.md', {
  query: '?raw',
  import: 'default',
});
const answerModules = import.meta.glob('../generated/benchmarks/*/answer.md', {
  query: '?raw',
  import: 'default',
});

type Loader = () => Promise<string>;

function loaderFor(
  modules: Record<string, () => Promise<unknown>>,
  slug: string,
  file: string,
): Loader | undefined {
  return modules[`../generated/benchmarks/${slug}/${file}`] as Loader | undefined;
}

interface Loaded {
  slug: string;
  readme: string;
  question: string | null;
  answer: string | null;
}

// Paragraphs and lists in the lead sit flush at the top and bottom and 1em apart.
// A question written as a list item shows without a bullet or indent.
const upper = { textTransform: 'uppercase' } as const;

const leadBlocks = {
  '& p, & ul, & ol': { my: 0 },
  '&& > * + *': { mt: '1em' },
  '& li + li': { mt: '0.25em' },
} as const;

export function BenchmarkDetail() {
  const { slug = '' } = useParams();
  const benchmark = content.benchmarks.find((b) => b.slug === slug);
  // Tagged with its slug so a page never shows the previous benchmark's text while the next loads.
  const [loadedState, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loaded = loadedState && loadedState.slug === slug ? loadedState : null;
  const markdown = loaded?.readme ?? null;
  const topic = content.topics.find((t) => t.id === benchmark?.topic);
  const hasCharts = Boolean(benchmark?.timeseries);
  const hasSaves = (benchmark?.saves.length ?? 0) > 0;
  const hasTabs = hasCharts || hasSaves;
  const [tab, setTab] = useState<'readme' | 'charts' | 'saves'>('readme');

  useEffect(() => {
    setTab('readme');
  }, [hasTabs, slug]);

  useEffect(() => {
    setLoaded(null);
    setError(null);
    if (!benchmark) return;
    const readme = loaderFor(readmeModules, benchmark.slug, 'README.md');
    if (!readme) {
      setError('README content not found for this benchmark.');
      return;
    }
    const question = benchmark.question
      ? loaderFor(questionModules, benchmark.slug, 'question.md')
      : undefined;
    const answer = question ? loaderFor(answerModules, benchmark.slug, 'answer.md') : undefined;
    let cancelled = false;
    // Everything arrives together, so the page does not jump.
    Promise.all([readme(), question?.() ?? null, answer?.() ?? null])
      .then(([md, q, a]) => {
        if (cancelled) return;
        setLoaded({
          slug: benchmark.slug,
          readme: md.replace(/^\s*#\s+.*\r?\n+/, ''),
          question: q,
          answer: a,
        });
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => {
      cancelled = true;
    };
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
          <Box
            component="nav"
            aria-label="Breadcrumb"
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              columnGap: 1,
              fontSize: 13,
              mb: 0.5,
              '& a': { display: 'inline-flex', alignItems: 'center', minHeight: 24 },
            }}
          >
            <Link component={RouterLink} to="/benchmarks" underline="hover" color="primary.main">
              Benchmarks
            </Link>
            {topic && (
              <>
                <Box component="span" aria-hidden sx={{ color: 'text.secondary' }}>
                  /
                </Box>
                <Link
                  component={RouterLink}
                  to={`/benchmarks?topic=${encodeURIComponent(topic.id)}`}
                  underline="hover"
                  color="primary.main"
                >
                  {topic.label}
                </Link>
              </>
            )}
          </Box>
          <PageHeader title={benchmark.title} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mt: 1 }}>
            {benchmark.date && (
              <Typography component="span" sx={{ fontSize: 13, color: 'text.secondary' }}>
                {benchmark.date}
              </Typography>
            )}
            {benchmark.factorioVersion && (
              <Chip size="small" variant="outlined" label={`Factorio ${benchmark.factorioVersion}`} />
            )}
            {benchmark.platform && (
              <Chip size="small" variant="outlined" label={formatPlatform(benchmark.platform)} />
            )}
            {benchmark.cpu && <Chip size="small" variant="outlined" label={benchmark.cpu} />}
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
                label="Interactive metrics"
              />
            )}
            {benchmark.tags?.map((t) => (
              <Chip key={t} label={t} size="small" variant="outlined" />
            ))}
          </Box>
          {loaded?.question && (
            <Box
              component="section"
              aria-label="Question and answer"
              sx={{
                backgroundColor: 'background.paper',
                p: 2,
                mt: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <MarkdownRenderer
                source={loaded.question}
                sx={{
                  fontSize: { xs: 18, md: 20 },
                  lineHeight: 1.4,
                  color: 'text.primary',
                  ...leadBlocks,
                  // Typography gives paragraphs their own size; the question sets it for the whole block.
                  '& p': { fontSize: 'inherit', lineHeight: 'inherit' },
                  '& > ul, & > ol': { p: 0, listStyle: 'none' },
                  // Some questions are written in lower case in the source README.
                  '& > p:first-child::first-letter': upper,
                  '& > ul:first-child > li:first-child::first-letter': upper,
                  '& > ul:first-child > li:first-child > p:first-child::first-letter': upper,
                }}
              />
              {loaded.answer && <MarkdownRenderer source={loaded.answer} sx={leadBlocks} />}
            </Box>
          )}
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
