import {
  Box,
  Chip,
  Link as MuiLink,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import index from '../generated/index.json';
import type { ContentIndex } from '../content';

const content = index as ContentIndex;

export function BenchmarksIndex() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const sorted = [...content.benchmarks].sort((a, b) =>
    (b.date ?? '').localeCompare(a.date ?? ''),
  );
  return (
    <Stack spacing={3}>
      <Typography variant="h3">Benchmarks</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        {content.benchmarks.length} curated benchmarks from the{' '}
        <MuiLink
          href={`https://github.com/${content.sourceRepo.owner}/${content.sourceRepo.repo}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          factorio-benchmarks
        </MuiLink>{' '}
        repo.
      </Typography>
      <TableContainer sx={{ border: 1, borderColor: 'divider' }}>
        <Table
          size="small"
          sx={{
            '& th': { fontWeight: 700 },
            '& .MuiTableCell-root': {
              px: { xs: 1, sm: 1.5 },
              py: { xs: 0.75, sm: 1.25 },
              verticalAlign: 'top',
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Title</TableCell>
              {!isMobile && <TableCell>Factorio</TableCell>}
              {!isMobile && <TableCell>Platform</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((b) => (
              <TableRow key={b.slug} hover>
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
                  <MuiLink
                    component={RouterLink}
                    to={`/benchmarks/${b.slug}`}
                    underline="hover"
                    sx={{ fontWeight: 600, fontSize: { xs: '0.925rem', sm: '1rem' } }}
                  >
                    {b.title}
                  </MuiLink>
                  {!isMobile && b.summary ? (
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', mt: 0.5 }}
                    >
                      {b.summary}
                    </Typography>
                  ) : null}
                  {isMobile ? (
                    <Box sx={{ display: 'flex', gap: 0.75, mt: 0.75, flexWrap: 'wrap' }}>
                      {b.factorioVersion ? (
                        <Chip label={b.factorioVersion} size="small" variant="outlined" />
                      ) : null}
                      {b.platform ? (
                        <Chip
                          label={formatPlatform(b.platform)}
                          size="small"
                          variant="outlined"
                        />
                      ) : null}
                    </Box>
                  ) : null}
                </TableCell>
                {!isMobile && (
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {b.factorioVersion ? (
                      <Chip label={b.factorioVersion} size="small" variant="outlined" />
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                        —
                      </Typography>
                    )}
                  </TableCell>
                )}
                {!isMobile && (
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {b.platform ? (
                      <Tooltip title={b.platform}>
                        <Chip
                          label={formatPlatform(b.platform)}
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                        —
                      </Typography>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

function formatPlatform(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes('windows') || lower.startsWith('win')) return 'Windows';
  if (lower.includes('linux')) return 'Linux';
  if (lower.includes('mac') || lower.includes('darwin')) return 'macOS';
  return raw;
}
