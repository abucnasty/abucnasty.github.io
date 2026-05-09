import type { ReactNode } from 'react';
import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';
import { NavLink as RouterNavLink, Link as RouterLink } from 'react-router-dom';
import { SocialLinks } from './SocialLinks';

const navItems = [
  { to: '/benchmarks', label: 'Benchmarks' },
  { to: '/blueprints', label: 'Blueprints' },
  { to: '/about', label: 'About' },
];

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" color="default" elevation={0} sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography
            component={RouterLink}
            to="/"
            variant="h6"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            abucnasty
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box component="nav" sx={{ display: 'flex', gap: 3 }}>
            {navItems.map((item) => (
              <Typography
                key={item.to}
                component={RouterNavLink}
                to={item.to}
                sx={{
                  color: 'text.primary',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  fontSize: 14,
                  letterSpacing: 1,
                  '&.active': { color: 'primary.main' },
                  '&:hover': { color: 'primary.light' },
                }}
              >
                {item.label}
              </Typography>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>

      <Box
        component="footer"
        sx={{
          backgroundColor: 'common.black',
          py: 3,
          mt: 'auto',
        }}
      >
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            © {new Date().getFullYear()} abucnasty
          </Typography>
          <SocialLinks />
        </Container>
      </Box>
    </Box>
  );
}
