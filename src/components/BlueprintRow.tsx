import { useRef, useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Link,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import YouTubeIcon from '@mui/icons-material/YouTube';
import ImageIcon from '@mui/icons-material/Image';
import type { BlueprintEntry } from '../content';

interface BlueprintRowProps {
  entry: BlueprintEntry;
}

export function BlueprintRow({ entry }: BlueprintRowProps) {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const previewUrl = entry.factoriobinPreviewUrl;

  return (
    <Stack
      direction="row"
      spacing={{ xs: 1, sm: 1.5 }}
      alignItems="center"
      sx={{
        py: { xs: 0.65, sm: 1 },
        px: { xs: 0.75, sm: 1 },
        borderBottom: 1,
        borderColor: 'divider',
        opacity: entry.deprecated ? 0.55 : 1,
        transition: 'background-color 120ms',
        '&:hover': { backgroundColor: 'action.hover' },
      }}
    >
      {/* Thumbnail / icon */}
      <Box
        ref={anchorRef}
        onMouseEnter={() => previewUrl && setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        sx={{
          width: { xs: 44, sm: 56 },
          height: { xs: 26, sm: 32 },
          flexShrink: 0,
          backgroundColor: 'common.black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: previewUrl ? 'zoom-in' : 'default',
        }}
      >
        {previewUrl ? (
          <Box
            component="img"
            src={previewUrl}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <ImageIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
        )}
      </Box>

      {previewUrl && (
        <Popover
          open={open}
          anchorEl={anchorRef.current}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
          transformOrigin={{ vertical: 'center', horizontal: 'left' }}
          disableRestoreFocus
          sx={{ pointerEvents: 'none' }}
          PaperProps={{ sx: { ml: 1, p: 0.5, backgroundColor: 'common.black' } }}
        >
          <Box
            component="img"
            src={previewUrl}
            alt=""
            referrerPolicy="no-referrer"
            sx={{ display: 'block', maxWidth: 480, maxHeight: 360, objectFit: 'contain' }}
          />
        </Popover>
      )}

      {/* Description */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
          }}
          title={entry.description}
        >
          {entry.description}
        </Typography>

        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{ mt: 0.5, display: { xs: 'flex', sm: 'none' }, flexWrap: 'wrap', gap: 0.5 }}
        >
          {entry.version && (
            <Chip
              label={`v${entry.version}`}
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ height: 18, fontSize: 10 }}
            />
          )}
          {entry.deprecated && (
            <Chip
              label="Deprecated"
              size="small"
              color="warning"
              variant="outlined"
              sx={{ height: 18, fontSize: 10 }}
            />
          )}
        </Stack>
      </Box>

      {/* Inline metadata */}
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        sx={{ flexShrink: 0, display: { xs: 'none', sm: 'flex' } }}
      >
        {entry.version && (
          <Chip
            label={`v${entry.version}`}
            size="small"
            color="secondary"
            variant="outlined"
            sx={{ height: 20, fontSize: 11 }}
          />
        )}
        {entry.author && (
          <Chip
            label={entry.author}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: 11 }}
          />
        )}
        {entry.deprecated && (
          <Chip
            label="Deprecated"
            size="small"
            color="warning"
            variant="outlined"
            sx={{ height: 20, fontSize: 11 }}
          />
        )}
      </Stack>

      {/* Actions */}
      <Stack direction="row" spacing={0} sx={{ flexShrink: 0, ml: { xs: 0.5, sm: 0 } }}>
        {entry.factoriobinUrl && (
          <Tooltip title="Open on factoriobin">
            <IconButton
              component={Link}
              href={entry.factoriobinUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              color="primary"
              sx={{ p: { xs: 0.35, sm: 0.6 } }}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {entry.youtubeUrl && (
          <Tooltip title="Watch video">
            <IconButton
              component={Link}
              href={entry.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              sx={{ color: 'error.main' }}
              
            >
              <YouTubeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
}
