import { useState, type ReactNode } from 'react';
import { AppBar, Box, Container, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { NavLink as RouterNavLink, Link as RouterLink } from 'react-router-dom';
import { SocialLinks } from './SocialLinks';
import { BrandAvatar } from './BrandAvatar';

const navItems = [
  { to: '/benchmarks', label: 'Benchmarks' },
  { to: '/blueprints', label: 'Blueprints' },
  { to: '/tools', label: 'Tools' },
  { to: '/about', label: 'About' },
];

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" color="default" elevation={0} sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar sx={{ gap: 2 }}>
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <BrandAvatar sx={{ width: 36, height: 36, borderWidth: '2px' }} />
            <Typography
              variant="h6"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: 1,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              abucnasty
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop nav */}
          <Box component="nav" sx={{ display: { xs: 'none', sm: 'flex' }, gap: 3 }}>
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

          {/* Mobile hamburger */}
          <IconButton
            sx={{ display: { xs: 'flex', sm: 'none' } }}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            edge="end"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        disableScrollLock
        PaperProps={{ sx: { width: 220, backgroundColor: 'background.paper' } }}
      >
        <List sx={{ pt: 2 }}>
          {navItems.map((item) => (
            <ListItem key={item.to} disablePadding>
              <ListItemButton
                component={RouterNavLink}
                to={item.to}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  '&.active .MuiListItemText-primary': { color: 'primary.main' },
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ textTransform: 'uppercase', fontSize: 14, letterSpacing: 1 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

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
