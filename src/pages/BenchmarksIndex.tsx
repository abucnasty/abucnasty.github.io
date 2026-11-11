import {
  Box,
  Chip,
  Link as MuiLink,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import DownloadIcon from '@mui/icons-material/Download';
import { Link as RouterLink } from 'react-router-dom';
import index from '../generated/index.json';
import type { BenchmarkEntry, ContentIndex } from '../content';
import { formatPlatform } from '../format';
import { DenseTable } from '../components/DenseTable';
import { PageHeader } from '../components/PageHeader';
import { layout } from '../layout';
import { saveFolderRoute } from '../saves';

const content = index as ContentIndex;

const chipSx = { height: 20, fontSize: 12 };

function ChartMarker() {
  return (
    <Tooltip title="Interactive metrics">
      <Box
        component="span"
        role="img"
        aria-label="Interactive metrics"
        sx={{ display: 'inline-flex', color: 'primary.main' }}
      >
        <BarChartIcon sx={{ fontSize: 16 }} />
      </Box>
    </Tooltip>
  );
}

function SaveMarker({ b }: { b: BenchmarkEntry }) {
  return (
    <MuiLink
      component={RouterLink}
      to={saveFolderRoute(b.source)}
      underline="none"
      aria-label={`${b.saves.length} save files for ${b.title}`}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        // 24 px tap target on phones. The negative vertical margin keeps the row no taller than
        // it was: the 20 px chips beside the link set the line height, as before.
        minHeight: { xs: 24 },
        minWidth: { xs: 24 },
        my: { xs: -0.5 },
        color: 'text.secondary',
        fontSize: 13,
        '&:hover': { color: 'primary.main' },
      }}
    >
      <DownloadIcon sx={{ fontSize: 16 }} />
      {b.saves.length}
    </MuiLink>
  );
}

export function BenchmarksIndex() {
  const sorted = [...content.benchmarks].sort((a, b) =>
    (b.date ?? '').localeCompare(a.date ?? ''),
  );
  return (
    <Stack spacing={2}>
      <PageHeader
        title="Benchmarks"
        meta={
          <>
            {content.benchmarks.length} curated benchmarks from the{' '}
            <MuiLink
              href={`https://github.com/${content.sourceRepo.owner}/${content.sourceRepo.repo}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              factorio-benchmarks
            </MuiLink>{' '}
            repo.
          </>
        }
      />
      <DenseTable aria-label="Benchmarks">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Title</TableCell>
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Factorio</TableCell>
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Platform</TableCell>
            <TableCell
              aria-label="Charts and saves"
              align="right"
              sx={{ display: { xs: 'none', sm: 'table-cell' } }}
            />
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((b) => (
            <TableRow key={b.slug} hover sx={{ height: { xs: layout.touchTarget } }}>
              <TableCell
                sx={{
                  whiteSpace: 'nowrap',
                  color: 'text.secondary',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                {b.date ?? '—'}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, minWidth: 0 }}>
                  <MuiLink
                    component={RouterLink}
                    to={`/benchmarks/${b.slug}`}
                    underline="hover"
                    sx={{
                      fontWeight: 600,
                      fontSize: 14,
                      flexShrink: { xs: 1, md: 0 },
                    }}
                  >
                    {b.title}
                  </MuiLink>
                  {b.summary ? (
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        display: { xs: 'none', md: 'block' },
                        flex: 1,
                        minWidth: 0,
                        color: 'text.secondary',
                      }}
                    >
                      {b.summary}
                    </Typography>
                  ) : null}
                </Box>
                <Box
                  sx={{
                    display: { xs: 'flex', sm: 'none' },
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 0.75,
                    mt: 0.75,
                  }}
                >
                  {b.factorioVersion ? (
                    <Chip label={b.factorioVersion} size="small" variant="outlined" sx={chipSx} />
                  ) : null}
                  {b.platform ? (
                    <Chip
                      label={formatPlatform(b.platform)}
                      size="small"
                      variant="outlined"
                      sx={chipSx}
                    />
                  ) : null}
                  {b.timeseries ? <ChartMarker /> : null}
                  {b.saves.length > 0 ? <SaveMarker b={b} /> : null}
                </Box>
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, whiteSpace: 'nowrap' }}>
                {b.factorioVersion ? (
                  <Chip label={b.factorioVersion} size="small" variant="outlined" sx={chipSx} />
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                    —
                  </Typography>
                )}
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, whiteSpace: 'nowrap' }}>
                {b.platform ? (
                  <Tooltip title={b.platform}>
                    <Chip label={formatPlatform(b.platform)} size="small" variant="outlined" sx={chipSx} />
                  </Tooltip>
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                    —
                  </Typography>
                )}
              </TableCell>
              <TableCell
                align="right"
                sx={{ display: { xs: 'none', sm: 'table-cell' }, whiteSpace: 'nowrap' }}
              >
                {b.timeseries || b.saves.length > 0 ? (
                  <Stack
                    direction="row"
                    spacing={1.25}
                    sx={{ justifyContent: 'flex-end', alignItems: 'center' }}
                  >
                    {b.timeseries ? <ChartMarker /> : null}
                    {b.saves.length > 0 ? <SaveMarker b={b} /> : null}
                  </Stack>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DenseTable>
    </Stack>
  );
}
