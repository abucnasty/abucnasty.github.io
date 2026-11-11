import { useMemo, useState } from 'react';
import { Box, Button, Chip, Stack, Switch, Typography } from '@mui/material';
import blueprints from '../generated/blueprints.json';
import type { BlueprintIndex } from '../content';
import { BlueprintRow } from '../components/BlueprintRow';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { RowGroup } from '../components/ListRow';
import { layout } from '../layout';

const data = blueprints as BlueprintIndex;

export function Blueprints() {
  const [showDeprecated, setShowDeprecated] = useState(false);

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
                <Box key={cat.id}>
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
