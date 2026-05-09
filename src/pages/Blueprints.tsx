import { Fragment, useMemo, useState } from 'react';
import { Box, Button, Chip, Stack, Switch, Typography } from '@mui/material';
import blueprints from '../generated/blueprints.json';
import type { BlueprintIndex } from '../content';
import { BlueprintCard } from '../components/BlueprintCard';

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
  const totalDeprecated = data.categories.reduce(
    (n, c) => n + c.entries.filter((e) => e.deprecated).length,
    0,
  );

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h3">Blueprints</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
          {totalActive} active blueprints across {data.categories.length} categories.
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} alignItems="center">
        <Switch
          checked={showDeprecated}
          onChange={(_, v) => setShowDeprecated(v)}
          inputProps={{ 'aria-label': 'Show deprecated blueprints' }}
        />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Show deprecated ({totalDeprecated})
        </Typography>
      </Stack>

      {grouped.map(([parent, cats]) => (
        <Box key={parent}>
          <Typography variant="h4" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 3 }}>
            {parent}
          </Typography>
          <Stack spacing={4}>
            {cats.map((cat) => {
              const entries = showDeprecated ? cat.entries : cat.entries.filter((e) => !e.deprecated);
              if (entries.length === 0) return null;
              return (
                <Box key={cat.id}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    {cat.iconUrl && (
                      <Box
                        component="img"
                        src={cat.iconUrl}
                        alt=""
                        sx={{ width: 32, height: 32, objectFit: 'contain' }}
                      />
                    )}
                    <Typography variant="h5">{cat.name}</Typography>
                    <Chip label={`${entries.length}`} size="small" variant="outlined" />
                  </Stack>
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 3,
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    }}
                  >
                    {entries.map((entry, i) => (
                      <Fragment key={`${cat.id}-${i}`}>
                        <BlueprintCard entry={entry} />
                      </Fragment>
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>
      ))}

      <Button
        component="a"
        href="https://github.com/abucnasty/factorio-benchmarks/blob/master/docs/blueprints/README.md"
        target="_blank"
        rel="noopener noreferrer"
        variant="outlined"
        sx={{ alignSelf: 'flex-start' }}
      >
        Source on GitHub
      </Button>
    </Stack>
  );
}
