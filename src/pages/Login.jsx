/**
 * pages/Login.jsx — Modern Login Page
 */

import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, Alert, CircularProgress,
  Divider, Link, Paper,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { login } from '../utils/api';
import { brand } from '../theme';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

export default function Login({ setToken }) {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    try {
      const { token } = await login({ username, password });
      showToast(`Welcome back, ${username}!`, 'success', 'Login Successful');
      localStorage.setItem('token', token);
      if (setToken) setToken(token);
      setTimeout(() => navigate('/dashboard'), 900);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      showToast(err.message || 'Invalid credentials.', 'error', 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${brand.sidebarBg} 0%, #1E293B 50%, ${brand.primaryDark} 100%)`,
        p: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${brand.primary}15 0%, transparent 70%)` }} />
      <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${brand.accent}10 0%, transparent 70%)` }} />

      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.1)',
          bgcolor: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 2,
              background: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.accent} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 20 }}>SQ</Typography>
          </Box>
          <Typography variant="h5" fontWeight={800} color={brand.textPrimary}>
            Welcome back
          </Typography>
          <Typography variant="body2" color={brand.textSecondary} mt={0.5}>
            Sign in to Smart Queue
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
            autoComplete="username"
            slotProps={{
              input: { startAdornment: <PersonOutlineIcon sx={{ mr: 1, color: brand.textSecondary, fontSize: 20 }} /> },
            }}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            slotProps={{
              input: { startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: brand.textSecondary, fontSize: 20 }} /> },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 3, py: 1.4, fontSize: 15, fontWeight: 700 }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Sign In'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" textAlign="center" color="text.secondary">
          Don&apos;t have an account?{' '}
          <Link
            component={RouterLink}
            to="/register"
            sx={{ color: brand.primary, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Register here
          </Link>
        </Typography>
      </Paper>

      <Toast toast={toast} onClose={hideToast} />
    </Box>
  );
}