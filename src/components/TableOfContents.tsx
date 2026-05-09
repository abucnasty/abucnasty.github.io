import { useEffect, useMemo, useState } from 'react';
import { Box, Link, Typography } from '@mui/material';

interface Heading {
  id: string;
  text: string;
  level: number;
}

// Mirrors rehype-slug's github-slugger algorithm
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function parseHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const seen: Record<string, number> = {};
  let inCodeBlock = false;
  for (const line of markdown.split('\n')) {
    if (/^(`{3,}|~{3,})/.test(line)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    const m = line.match(/^(#{1,4})\s+(.+)$/);
    if (!m) continue;
    const level = m[1].length;
    // Strip inline markdown from display text
    const text = m[2].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, '').trim();
    const base = slugify(text);
    const count = seen[base] ?? 0;
    seen[base] = count + 1;
    const id = count === 0 ? base : `${base}-${count}`;
    headings.push({ id, text, level });
  }
  return headings;
}

interface TableOfContentsProps {
  markdown: string;
}

export function TableOfContents({ markdown }: TableOfContentsProps) {
  const headings = useMemo(() => parseHeadings(markdown), [markdown]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the first intersecting entry (topmost in viewport)
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length > 0) {
          setActiveId(intersecting[0].target.id);
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 },
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <Box>
      <Typography
        variant="overline"
        sx={{ color: 'primary.main', letterSpacing: 2, display: 'block', mb: 1, fontSize: '0.7rem' }}
      >
        On this page
      </Typography>
      <Box
        component="nav"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25,
          maxHeight: 360,
          overflowY: 'auto',
        }}
      >
        {headings.map(({ id, text, level }) => (
          <Link
            key={id}
            href={`#${id}`}
            underline="none"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            sx={{
              pl: (level - minLevel) * 1.5,
              py: 0.4,
              pr: 1,
              fontSize: '0.78rem',
              lineHeight: 1.4,
              color: activeId === id ? 'primary.main' : 'text.secondary',
              fontWeight: activeId === id ? 600 : 400,
              borderLeft: '2px solid',
              borderColor: activeId === id ? 'primary.main' : 'transparent',
              transition: 'color 0.15s, border-color 0.15s',
              cursor: 'pointer',
              '&:hover': { color: 'text.primary' },
            }}
          >
            {text}
          </Link>
        ))}
      </Box>
    </Box>
  );
}
