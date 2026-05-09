import { Box, Button, Divider, Link, Stack, Typography } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import YouTubeIcon from '@mui/icons-material/YouTube';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const tools = [
  {
    name: 'Belt',
    description: 'The CLI benchmarking tool used to run and record Factorio benchmarks.',
    url: 'https://github.com/florishafkenscheid/belt',
    author: 'florishafkenscheid',
  },
  {
    name: 'belt-charts',
    description: 'Chart generation tool for visualising Belt benchmark output. Powers the graphics and charts on this site.',
    url: 'https://github.com/abucnasty/belt-charts',
    author: 'abucnasty',
  },
];

const utilities = [
  {
    name: 'Clock Generator',
    description: 'A web app for designing and generating Factorio clock blueprint strings for stack inserters',
    url: 'https://github.com/abucnasty/factorio-scripts',
    author: 'abucnasty',
    liveUrl: 'https://clock-generator-self.vercel.app/',
  },
];

const tutorialResources = [
  {
    icon: <MenuBookIcon fontSize="small" />,
    label: 'How to Benchmark — written guide',
    url: 'https://github.com/abucnasty/factorio-benchmarks/blob/master/docs/guides/how-to-benchmark.md',
  },
  {
    icon: <YouTubeIcon fontSize="small" />,
    label: 'How to Benchmark — video walkthrough',
    url: 'https://youtu.be/pXz01Be-9hE',
  },
];

const mods = [
  {
    name: 'Clock Generator Sidecar',
    description: 'Select machines to extract crafting speeds and productivity bonuses. Export data for use with the Clock Generator tool.',
    url: 'https://mods.factorio.com/mod/clock-generator-sidecar',
    sourceUrl: 'https://github.com/abucnasty/factorio-scripts',
    downloads: 324,
  },
  {
    name: 'Particle Free Disposal',
    description: 'UPS mod that removes all particles related to destroying chests with a railgun.',
    url: 'https://mods.factorio.com/mod/particle_free_disposal',
    sourceUrl: 'https://github.com/abucnasty/particle-free-disposal',
    downloads: 265,
  },
];

export function Tools() {
  return (
    <Stack spacing={6} sx={{ maxWidth: 800 }}>
      <Box>
        <Typography variant="h3">Tools</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
          The open-source toolchain used for benchmarking and publishing results.
        </Typography>
      </Box>

      <Box>
        <Typography
          variant="overline"
          sx={{
            color: 'primary.main',
            letterSpacing: 2,
            display: 'block',
            borderBottom: '1px solid',
            borderColor: 'primary.main',
            pb: 0.5,
            mb: 2,
          }}
        >
          Benchmarking Tools
        </Typography>
        <Stack spacing={3}>
          {tools.map((tool) => (
            <Box
              key={tool.name}
              sx={{
                backgroundColor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                p: 3,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                    {tool.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    by {tool.author}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                    {tool.description}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexShrink={0} flexWrap="wrap">
                  <Button
                    component="a"
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    size="small"
                    startIcon={<GitHubIcon />}
                  >
                    View on GitHub
                  </Button>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      <Divider />

      <Box>
        <Typography
          variant="overline"
          sx={{
            color: 'primary.main',
            letterSpacing: 2,
            display: 'block',
            borderBottom: '1px solid',
            borderColor: 'primary.main',
            pb: 0.5,
            mb: 2,
          }}
        >
          Utilities
        </Typography>
        <Stack spacing={3}>
          {utilities.map((tool) => (
            <Box
              key={tool.name}
              sx={{
                backgroundColor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                p: 3,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                    {tool.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    by {tool.author}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                    {tool.description}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexShrink={0} flexWrap="wrap">
                  {tool.liveUrl && (
                    <Button
                      component="a"
                      href={tool.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="contained"
                      size="small"
                      startIcon={<OpenInNewIcon />}
                    >
                      Open app
                    </Button>
                  )}
                  <Button
                    component="a"
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    size="small"
                    startIcon={<GitHubIcon />}
                  >
                    View on GitHub
                  </Button>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      <Divider />

      <Box>
        <Typography
          variant="overline"
          sx={{
            color: 'primary.main',
            letterSpacing: 2,
            display: 'block',
            borderBottom: '1px solid',
            borderColor: 'primary.main',
            pb: 0.5,
            mb: 2,
          }}
        >
          Mods
        </Typography>
        <Stack spacing={3}>
          {mods.map((mod) => (
            <Box
              key={mod.name}
              sx={{
                backgroundColor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                p: 3,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                    {mod.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {mod.downloads} downloads
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                    {mod.description}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexShrink={0} flexWrap="wrap">
                  <Button
                    component="a"
                    href={mod.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                    size="small"
                    startIcon={<OpenInNewIcon />}
                  >
                    Mod portal
                  </Button>
                  <Button
                    component="a"
                    href={mod.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    size="small"
                    startIcon={<GitHubIcon />}
                  >
                    Source
                  </Button>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      <Divider />

      <Box>
        <Typography
          variant="overline"
          sx={{
            color: 'primary.main',
            letterSpacing: 2,
            display: 'block',
            borderBottom: '1px solid',
            borderColor: 'primary.main',
            pb: 0.5,
            mb: 2,
          }}
        >
          Docs
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          New to Factorio benchmarking? Start here.
        </Typography>
        <Stack spacing={2}>
          {tutorialResources.map((res) => (
            <Box
              key={res.url}
              sx={{
                backgroundColor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                p: 2.5,
              }}
            >
              <Link
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  color: 'text.primary',
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                <Box sx={{ color: 'primary.main', display: 'flex' }}>{res.icon}</Box>
                <Typography variant="body2">{res.label}</Typography>
              </Link>
            </Box>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
