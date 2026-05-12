import {
  Chip,
  Link as MuiLink,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { blogPosts } from '../blog/registry';

export function BlogIndex() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const sorted = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Stack spacing={3}>
      <Typography variant="h3">Blog</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        {blogPosts.length} {blogPosts.length === 1 ? 'post' : 'posts'}
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
              {!isMobile && <TableCell>Tags</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((post) => (
              <TableRow key={post.slug} hover>
                <TableCell
                  sx={{
                    whiteSpace: 'nowrap',
                    color: 'text.secondary',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  }}
                >
                  {post.date}
                </TableCell>
                <TableCell>
                  <MuiLink
                    component={RouterLink}
                    to={`/blog/${post.slug}`}
                    underline="hover"
                    sx={{ fontWeight: 600, fontSize: { xs: '0.925rem', sm: '1rem' } }}
                  >
                    {post.title}
                  </MuiLink>
                  {post.description && (
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', mt: 0.25, display: { xs: 'block', sm: 'block' } }}
                    >
                      {post.description}
                    </Typography>
                  )}
                  {isMobile && post.tags && post.tags.length > 0 && (
                    <Stack direction="row" flexWrap="wrap" gap={0.5} mt={0.5}>
                      {post.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Stack>
                  )}
                </TableCell>
                {!isMobile && (
                  <TableCell>
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {post.tags?.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Stack>
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
