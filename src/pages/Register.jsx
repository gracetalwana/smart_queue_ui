/**
 * pages/Register.jsx — Modern Registration Page
 */

import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, Alert, CircularProgress,
  Divider, Link, Paper,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { register } from '../utils/api';
import { brand } from '../theme';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

export default function Register() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const data = await register(username, password, email);
      showToast(data.message || 'Account created! Redirecting…', 'success', 'Welcome!');
      setSuccess(data.message || 'Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.message || 'Registration failed.');
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const passwordMismatch = !!confirm && password !== confirm;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${brand.sidebarBg} 0%, #1E293B 50%, ${brand.primaryDark} 100%)`,
        p: 2, position: 'relative', overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${brand.accent}12 0%, transparent 70%)` }} />
      <Box sx={{ position: 'absolute', bottom: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${brand.primary}10 0%, transparent 70%)` }} />

      <Paper
        elevation={0}
        sx={{
          width: '100%', maxWidth: 440,
          p: { xs: 3, sm: 5 }, borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.1)',
          bgcolor: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          position: 'relative', zIndex: 1,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 2,
              background: `linear-gradient(135deg, ${brand.accent} 0%, ${brand.primary} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 20 }}>SQ</Typography>
          </Box>
          <Typography variant="h5" fontWeight={800} color={brand.textPrimary}>
            Create Account
          </Typography>
          <Typography variant="body2" color={brand.textSecondary} mt={0.5}>
            Join Smart Queue today
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Username" fullWidth margin="normal"
            value={username} onChange={e => setUsername(e.target.value)}
            required autoFocus
            slotProps={{ input: { startAdornment: <PersonOutlineIcon sx={{ mr: 1, color: brand.textSecondary, fontSize: 20 }} /> } }}
          />
          <TextField
            label="Email" type="email" fullWidth margin="normal"
            value={email} onChange={e => setEmail(e.target.value)} required
            slotProps={{ input: { startAdornment: <EmailOutlinedIcon sx={{ mr: 1, color: brand.textSecondary, fontSize: 20 }} /> } }}
          />
          <TextField
            label="Password" type="password" fullWidth margin="normal"
            value={password} onChange={e => setPassword(e.target.value)} required
            slotProps={{ input: { startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: brand.textSecondary, fontSize: 20 }} /> } }}
          />
          <TextField
            label="Confirm Password" type="password" fullWidth margin="normal"
            value={confirm} onChange={e => setConfirm(e.target.value)} required
            error={passwordMismatch}
            helperText={passwordMismatch ? 'Passwords do not match' : ''}
            slotProps={{ input: { startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: passwordMismatch ? brand.error : brand.textSecondary, fontSize: 20 }} /> } }}
          />

          <Button
            type="submit" variant="contained" fullWidth
            disabled={loading || !!success}
            sx={{ mt: 3, py: 1.4, fontSize: 15, fontWeight: 700 }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Create Account'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" textAlign="center" color="text.secondary">
          Already have an account?{' '}
          <Link
            component={RouterLink} to="/login"
            sx={{ color: brand.primary, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Sign in here
          </Link>
        </Typography>
      </Paper>

      <Toast toast={toast} onClose={hideToast} />
    </Box>
  );
}