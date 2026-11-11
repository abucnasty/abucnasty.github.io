import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Button, Chip, Link, Stack, Switch, Typography } from '@mui/material';
import blueprints from '../generated/blueprints.json';
import index from '../generated/index.json';
import type { BlueprintIndex, ContentIndex } from '../content';
import { BlueprintRow } from '../components/BlueprintRow';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { RowGroup } from '../components/ListRow';
import { layout } from '../layout';

const data = blueprints as BlueprintIndex;
const topics = (index as ContentIndex).topics;

export function Blueprints() {
  const [showDeprecated, setShowDeprecated] = useState(false);
  const { hash } = useLocation();

  // The page renders after the browser's own hash scroll, so bring the category into view here.
  // A hash that is not on the page (or a category hidden as deprecated) does nothing.
  useEffect(() => {
    if (!hash) return;
    let id = hash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch {
      /* keep as written */
    }
    document.getElementById(id)?.scrollIntoView();
  }, [hash]);

  const grouped = useMemo(() => {
    const byParent = new Map<string, typeof data.categories>();
    for (const cat of data.categories) {
      const arr = byParent.get(cat.parent) ?? [];
      arr.push(cat);
      byParent.set(cat.parent, arr);
    }
    return Array.from(byParent.entries());
  }, []);

  const totalActive = data.categories.reduce(
    (n, c) => n + c.entries.filter((e) => !e.deprecated).length,
    0,
  );
  const activeCategories = data.categories.filter((c) => c.entries.some((e) => !e.deprecated)).length;
  const totalDeprecated = data.categories.reduce(
    (n, c) => n + c.entries.filter((e) => e.deprecated).length,
    0,
  );

  return (
    <Stack spacing={2}>
      <PageHeader
        title="Blueprints"
        meta={`${totalActive} active blueprints across ${activeCategories} categories.`}
        actions={
          <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
            <Switch
              size="small"
              checked={showDeprecated}
              onChange={(_, v) => setShowDeprecated(v)}
              slotProps={{ input: { 'aria-label': 'Show deprecated blueprints' } }}
            />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Show deprecated ({totalDeprecated})
            </Typography>
          </Stack>
        }
      />

      {grouped.map(([parent, cats]) => (
        <Stack key={parent} spacing={1.5}>
          <SectionHeader label={parent} />
          <Stack spacing={{ xs: 1.25, sm: 2 }}>
            {cats.map((cat) => {
              const entries = showDeprecated
                ? cat.entries
                : cat.entries.filter((e) => !e.deprecated);
              if (entries.length === 0) return null;
              return (
                <Box key={cat.id} id={cat.id} sx={{ scrollMarginTop: `${layout.topBarHeight + 16}px` }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 0.5, px: { xs: 0.75, sm: 1 } }}
                  >
                    {cat.iconUrl && (
                      <Box
                        component="img"
                        src={cat.iconUrl}
                        alt=""
                        sx={{ width: { xs: 16, sm: 20 }, height: { xs: 16, sm: 20 }, objectFit: 'contain' }}
                      />
                    )}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      {cat.name}
                    </Typography>
                    <Chip
                      label={entries.length}
                      size="small"
                      variant="outlined"
                      sx={{ height: { xs: 16, sm: 18 }, fontSize: { xs: 10, sm: 11 } }}
                    />
                    <Box sx={{ flexGrow: 1 }} />
                    {topics
                      .filter((t) => t.blueprintCategories.includes(cat.id))
                      .map((t) => (
                        <Link
                          key={t.id}
                          component={RouterLink}
                          to={`/benchmarks?topic=${encodeURIComponent(t.id)}`}
                          underline="hover"
                          color="primary.main"
                          sx={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', minHeight: 24 }}
                        >
                          {t.label} benchmarks
                        </Link>
                      ))}
                  </Stack>
                  <RowGroup>
                    {entries.map((entry, i) => (
                      <BlueprintRow key={`${cat.id}-${i}`} entry={entry} />
                    ))}
                  </RowGroup>
                </Box>
              );
            })}
          </Stack>
        </Stack>
      ))}

      <Button
        component="a"
        href="https://github.com/abucnasty/factorio-benchmarks/blob/master/docs/blueprints/README.md"
        target="_blank"
        rel="noopener noreferrer"
        variant="outlined"
        size="small"
        sx={{ alignSelf: 'flex-start', minHeight: { xs: layout.touchTarget } }}
      >
        Source on GitHub
      </Button>
    </Stack>
  );
}
