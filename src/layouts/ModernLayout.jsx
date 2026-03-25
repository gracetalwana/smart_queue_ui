/**
 * layouts/ModernLayout.jsx — Modern App Shell
 *
 * Clean sidebar with dark slate background, teal accents, responsive drawer.
 * Top bar with breadcrumbs and user chip. Sticky footer.
 */

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, ListItemButton, ListItemIcon,
  ListItemText, Typography, Avatar, Divider, Stack, Tooltip,
  IconButton, Breadcrumbs, Link, Chip, useMediaQuery, useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import QueueIcon from '@mui/icons-material/Queue';
import ViewListIcon from '@mui/icons-material/ViewList';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { brand } from '../theme';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/book-slot', label: 'Book Slot', icon: <EventAvailableIcon />, role: 'STUDENT' },
  { path: '/my-queue', label: 'My Queue', icon: <QueueIcon />, role: 'STUDENT' },
  { path: '/users', label: 'Users', icon: <PeopleIcon />, role: 'ADMIN' },
  { path: '/reports', label: 'Reports', icon: <AssessmentIcon /> },
  { path: '/admin/slots', label: 'Manage Slots', icon: <ViewListIcon />, role: 'ADMIN' },
  { path: '/admin/queue', label: 'Queue Console', icon: <ManageAccountsIcon />, role: 'ADMIN' },
];

const PAGE_LABELS = {
  '/dashboard': 'Dashboard',
  '/users': 'Users',
  '/reports': 'Reports',
  '/book-slot': 'Book Slot',
  '/my-queue': 'My Queue',
  '/admin/slots': 'Manage Slots',
  '/admin/queue': 'Queue Console',
};

const AVATAR_COLORS = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
const avatarBg = (name = '') =>
  AVATAR_COLORS[(name.codePointAt(0) ?? 0) % AVATAR_COLORS.length];

export default function ModernLayout({ children, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const username = user?.username ?? 'User';
  const pageLabel = PAGE_LABELS[location.pathname] ?? 'Page';

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleNav = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const drawer = (
    <Box
      sx={{
        display: 'flex', flexDirection: 'column', height: '100%',
        bgcolor: brand.sidebarBg, color: '#fff',
      }}
    >
      {/* Brand header */}
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 38, height: 38, borderRadius: 2.5,
              background: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.accent} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 16, color: '#fff',
              flexShrink: 0,
            }}
          >
            SQ
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ color: '#fff', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}
            >
              Smart Queue
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 0.5 }}
            >
              Queuing System
            </Typography>
          </Box>
          {isMobile && (
            <IconButton onClick={() => setMobileOpen(false)} sx={{ ml: 'auto', color: 'rgba(255,255,255,0.5)' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />

      {/* Nav list */}
      <List sx={{ px: 1.5, pt: 1.5, flexGrow: 1 }}>
        {NAV_ITEMS.filter(({ role }) => {
          if (!role) return true;
          if (role === 'STUDENT') return !['ADMIN', 'SUPER_ADMIN'].includes(user?.role);
          if (role === 'ADMIN') return ['ADMIN', 'SUPER_ADMIN'].includes(user?.role);
          return true;
        }).map(({ path, label, icon }) => {
          const active = location.pathname === path;
          return (
            <ListItemButton
              key={path}
              onClick={() => handleNav(path)}
              sx={{
                borderRadius: 2.5,
                mb: 0.5,
                px: 2,
                py: 1.2,
                color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                bgcolor: active ? 'rgba(14,165,233,0.15)' : 'transparent',
                '&:hover': {
                  bgcolor: active ? 'rgba(14,165,233,0.2)' : 'rgba(255,255,255,0.05)',
                  color: '#fff',
                },
                transition: 'all 0.15s ease',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: active ? brand.primary : 'rgba(255,255,255,0.4)',
                }}
              >
                {icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: active ? 600 : 400, fontSize: 14, color: 'inherit' }}>
                    {label}
                  </Typography>
                }
              />
              {active && (
                <Box
                  sx={{
                    width: 4, height: 20, borderRadius: 2,
                    bgcolor: brand.primary, ml: 1,
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />

      {/* User card at bottom */}
      <Box sx={{ px: 2, py: 2 }}>
        <Stack
          direction="row" alignItems="center" spacing={1.5}
          sx={{
            p: 1.5, borderRadius: 2.5,
            bgcolor: 'rgba(255,255,255,0.05)',
          }}
        >
          <Avatar
            sx={{
              width: 34, height: 34,
              bgcolor: avatarBg(username),
              fontWeight: 700, fontSize: 14,
            }}
          >
            {username[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography
              variant="body2"
              sx={{ color: '#fff', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {username}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>
              {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : user?.role === 'ADMIN' ? 'Admin' : 'Student'}
            </Typography>
          </Box>
          <Tooltip title="Logout">
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{
                color: 'rgba(255,255,255,0.4)',
                '&:hover': { color: brand.error, bgcolor: 'rgba(239,68,68,0.1)' },
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: brand.bgDefault }}>

      {/* Sidebar — permanent on desktop, temporary on mobile */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Main content area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '100vh' }}>

        {/* Top bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: '#fff',
            borderBottom: `1px solid ${brand.border}`,
            color: brand.textPrimary,
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 56, md: 64 }, gap: 1 }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" sx={{ color: brand.textSecondary }} />}
              sx={{ flexGrow: 1 }}
            >
              <Link
                underline="hover"
                onClick={() => navigate('/dashboard')}
                sx={{ cursor: 'pointer', fontSize: 13, color: brand.textSecondary, fontWeight: 500 }}
              >
                Home
              </Link>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: brand.textPrimary }}>
                {pageLabel}
              </Typography>
            </Breadcrumbs>

            <Chip
              avatar={
                <Avatar sx={{ bgcolor: `${avatarBg(username)} !important`, fontSize: 11, width: 26, height: 26 }}>
                  {username[0]?.toUpperCase()}
                </Avatar>
              }
              label={username}
              size="small"
              variant="outlined"
              sx={{ borderColor: brand.border, color: brand.textPrimary, fontWeight: 500, fontSize: 12 }}
            />
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
          {children}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            textAlign: 'center',
            py: 1.5,
            borderTop: `1px solid ${brand.border}`,
            color: brand.textSecondary,
            fontSize: 11,
            fontWeight: 500,
          }}
        >
          © {new Date().getFullYear()} Smart Queue — University Queuing System
        </Box>
      </Box>
    </Box>
  );
}