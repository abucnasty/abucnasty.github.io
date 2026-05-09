import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import YouTubeIcon from '@mui/icons-material/YouTube';

const YT_CHANNEL_ID = 'UCSdiZ-R-EnnHqKvCrZdQMBQ';

interface LatestVideo {
  id: string;
  title: string;
  published?: string;
  url: string;
}

async function fetchLatestVideo(): Promise<LatestVideo | null> {
  // YouTube's own RSS feed has no CORS headers, so we go through rss2json,
  // which proxies any public RSS feed and returns CORS-enabled JSON.
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`;
  const res = await fetch(
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`,
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    status?: string;
    items?: Array<{ title: string; link: string; pubDate?: string; guid?: string }>;
  };
  if (data.status !== 'ok' || !data.items?.length) return null;
  const item = data.items[0];
  const idFromGuid = /yt:video:([\w-]+)/.exec(item.guid ?? '')?.[1];
  const idFromLink = /[?&]v=([\w-]+)/.exec(item.link ?? '')?.[1];
  const id = idFromGuid ?? idFromLink;
  if (!id) return null;
  return {
    id,
    title: item.title,
    published: item.pubDate,
    url: item.link,
  };
}

export function LatestVideo() {
  const [video, setVideo] = useState<LatestVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchLatestVideo()
      .then((v) => {
        if (!cancelled) setVideo(v);
      })
      .catch(() => {
        /* ignore */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={18} />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Loading latest video…
        </Typography>
      </Box>
    );
  }

  if (!video) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Couldn't load the latest video.{' '}
        <Link
          href="https://www.youtube.com/@abucnasty"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit the channel
        </Link>
        .
      </Typography>
    );
  }

  const thumbUrl = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 2, sm: 3 }}
      sx={{
        backgroundColor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        p: { xs: 2, sm: 2.5 },
        alignItems: { xs: 'stretch', sm: 'center' },
      }}
    >
      <Box
        onClick={() => !playing && setPlaying(true)}
        sx={{
          position: 'relative',
          width: { xs: '100%', sm: 320 },
          flexShrink: 0,
          aspectRatio: '16 / 9',
          backgroundColor: 'common.black',
          cursor: playing ? 'default' : 'pointer',
          overflow: 'hidden',
          '&:hover .play-overlay': {
            backgroundColor: 'rgba(0,0,0,0.35)',
          },
          '&:hover .play-icon': {
            transform: 'translate(-50%, -50%) scale(1.1)',
          },
        }}
      >
        {playing ? (
          <Box
            component="iframe"
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              border: 0,
            }}
          />
        ) : (
          <>
            <Box
              component="img"
              src={thumbUrl}
              alt=""
              loading="lazy"
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <Box
              className="play-overlay"
              sx={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.15)',
                transition: 'background-color 150ms',
              }}
            />
            <IconButton
              className="play-icon"
              aria-label={`Play ${video.title}`}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'primary.main',
                color: 'common.black',
                width: 56,
                height: 56,
                transition: 'transform 150ms',
                '&:hover': { backgroundColor: 'primary.main' },
              }}
            >
              <PlayArrowIcon sx={{ fontSize: 36 }} />
            </IconButton>
          </>
        )}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="overline"
          sx={{ color: 'primary.main', letterSpacing: 2, display: 'block' }}
        >
          Latest video
        </Typography>
        <Typography variant="h6" sx={{ mt: 0.5, lineHeight: 1.25 }}>
          {video.title}
        </Typography>
        {video.published && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Published {new Date(video.published).toLocaleDateString()}
          </Typography>
        )}
        <Button
          component={Link}
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          size="small"
          startIcon={<YouTubeIcon />}
          sx={{ mt: 2 }}
        >
          Watch on YouTube
        </Button>
      </Box>
    </Stack>
  );
}
