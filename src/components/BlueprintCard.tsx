import { Box, Button, Card, CardContent, Chip, Link, Stack, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import YouTubeIcon from '@mui/icons-material/YouTube';
import type { BlueprintEntry } from '../content';

interface BlueprintCardProps {
  entry: BlueprintEntry;
}

export function BlueprintCard({ entry }: BlueprintCardProps) {
  const previewUrl = entry.factoriobinPreviewUrl;
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
        opacity: entry.deprecated ? 0.6 : 1,
      }}
    >
      {previewUrl && (
        <Link
          href={entry.factoriobinUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: 'block',
            overflow: 'hidden',
            backgroundColor: 'common.black',
          }}
        >
          <Box
            component="img"
            src={previewUrl}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            sx={{
              width: '100%',
              display: 'block',
              aspectRatio: '16 / 9',
              objectFit: 'contain',
            }}
          />
        </Link>
      )}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {entry.description}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {entry.version && <Chip label={`v${entry.version}`} size="small" color="secondary" variant="outlined" />}
          {entry.author && <Chip label={entry.author} size="small" variant="outlined" />}
          {entry.deprecated && <Chip label="Deprecated" size="small" color="warning" variant="outlined" />}
        </Stack>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {entry.factoriobinUrl && (
            <Button
              component="a"
              href={entry.factoriobinUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              size="small"
              endIcon={<OpenInNewIcon />}
            >
              factoriobin
            </Button>
          )}
          {entry.youtubeUrl && (
            <Button
              component="a"
              href={entry.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="small"
              color="secondary"
              startIcon={<YouTubeIcon />}
            >
              video
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
