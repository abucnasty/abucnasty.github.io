import { Box, Chip, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import index from '../generated/index.json';
import blueprints from '../generated/blueprints.json';
import type { BlueprintIndex, ContentIndex } from '../content';
import { blogPosts } from '../blog/registry';
import { formatBytes } from '../format';
import { layout } from '../layout';
import { SocialLinks } from '../components/SocialLinks';
import { LatestVideo } from '../components/LatestVideo';
import { BrandAvatar } from '../components/BrandAvatar';
import { SectionHeader } from '../components/SectionHeader';
import { ListRow, RowGroup } from '../components/ListRow';

const content = index as ContentIndex;
const blueprintIndex = blueprints as BlueprintIndex;

const LATEST_COUNT = 8;

interface FeedItem {
  key: string;
  to: string;
  date: string;
  title: string;
  /** Chip text: the Factorio version for a benchmark, "Post" for a post. */
  tag?: string;
}

function benchmarkItem(b: ContentIndex['benchmarks'][number]): FeedItem {
  return {
    key: `benchmark:${b.slug}`,
    to: `/benchmarks/${b.slug}`,
    date: b.date ?? '',
    title: b.title,
    tag: b.factorioVersion,
  };
}

function FeedRow({ item }: { item: FeedItem }) {
  return (
    <ListRow
      to={item.to}
      lead={
        <Box
          component="span"
          sx={{ fontSize: 13, color: 'text.secondary', fontVariantNumeric: 'tabular-nums', width: 76 }}
        >
          {item.date || ' '}
        </Box>
      }
      title={item.title}
      trailing={
        item.tag ? (
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Chip label={item.tag} size="small" variant="outlined" />
          </Box>
        ) : undefined
      }
    />
  );
}

const latest: FeedItem[] = [
  ...content.benchmarks.filter((b) => b.date).map(benchmarkItem),
  ...blogPosts.map(
    (p): FeedItem => ({
      key: `post:${p.slug}`,
      to: `/blog/${p.slug}`,
      date: p.date,
      title: p.title,
      tag: 'Post',
    }),
  ),
]
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  .slice(0, LATEST_COUNT);

const latestKeys = new Set(latest.map((i) => i.key));
const featured = content.benchmarks
  .filter((b) => b.featured)
  .map(benchmarkItem)
  .filter((i) => !latestKeys.has(i.key));

const activeBlueprints = blueprintIndex.categories.reduce(
  (n, c) => n + c.entries.filter((e) => !e.deprecated).length,
  0,
);

const alsoHere: Array<{ title: string; subtitle: string; to: string }> = [
  { title: 'Blueprints', subtitle: `${activeBlueprints} active blueprints`, to: '/blueprints' },
  {
    title: 'Save files',
    subtitle: `${content.saveStats.count} saves, ${formatBytes(content.saveStats.bytes)}`,
    to: '/saves',
  },
  { title: 'Tools and mods', subtitle: 'Benchmarking tools, utilities and mods', to: '/tools' },
  {
    title: 'Blog',
    subtitle: `${blogPosts.length} ${blogPosts.length === 1 ? 'post' : 'posts'}`,
    to: '/blog',
  },
  { title: 'About', subtitle: 'Who runs this and how to get in touch', to: '/about' },
];

export function Home() {
  return (
    <Stack spacing={layout.sectionGap}>
      <Box
        data-home-strip
        sx={{
          backgroundColor: 'background.paper',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <BrandAvatar sx={{ width: 44, height: 44 }} />
        <Box sx={{ flex: '1 1 280px', minWidth: 0, order: { xs: 2, md: 0 } }}>
          <Typography component="h1" sx={{ fontSize: 20, fontWeight: 700, lineHeight: 1.25 }}>
            Factorio benchmarks, blueprints, and tools.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            UPS research and side-projects from abucnasty. Everything here is open source.
          </Typography>
        </Box>
        {/* On phones the links sit beside the avatar so the strip stays short. */}
        <Box sx={{ order: { xs: 1, md: 0 }, ml: { xs: 'auto', md: 0 } }}>
          <SocialLinks />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.75fr) minmax(0, 1fr)' },
          gap: { xs: layout.sectionGap, md: 4 },
          alignItems: 'start',
        }}
      >
        <Stack spacing={layout.sectionGap}>
          <Box>
            <SectionHeader label="Latest" summary="benchmarks and posts, newest first" />
            <RowGroup>
              {latest.map((item) => (
                <FeedRow key={item.key} item={item} />
              ))}
            </RowGroup>
            <Typography
              component={RouterLink}
              to="/benchmarks"
              variant="body2"
              sx={{
                display: 'flex',
                alignItems: 'center',
                minHeight: { xs: layout.touchTarget, md: 'auto' },
                py: 1,
                px: 1.25,
                color: 'primary.main',
              }}
            >
              All {content.benchmarks.length} benchmarks
            </Typography>
          </Box>
          {featured.length > 0 && (
            <Box>
              <SectionHeader label="Featured" />
              <RowGroup>
                {featured.map((item) => (
                  <FeedRow key={item.key} item={item} />
                ))}
              </RowGroup>
            </Box>
          )}
        </Stack>

        <Stack spacing={layout.sectionGap}>
          <Box>
            <SectionHeader label="Also here" />
            <RowGroup>
              {alsoHere.map((r) => (
                <ListRow key={r.to} to={r.to} title={r.title} subtitle={r.subtitle} />
              ))}
            </RowGroup>
          </Box>
          <Box>
            <SectionHeader label="Latest video" />
            <LatestVideo compact />
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
