/**
 * pages/Users.jsx — User Management Page
 */

import { useEffect, useState } from 'react';
import { getUsers, updateUser, deleteUser } from '../utils/api';
import { fmtDate } from '../utils/format';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';
import {
  Box, Typography, Grid, Card, CardContent, CardActions, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  Avatar, Stack, Alert, CircularProgress, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip,
  ToggleButton, ToggleButtonGroup, Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { brand } from '../theme';

const AVATAR_COLORS = [brand.primary, brand.accent, brand.success, brand.info, brand.warning];
const avatarBg = (name = '') =>
  AVATAR_COLORS[(name.codePointAt(0) ?? 0) % AVATAR_COLORS.length];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Users({ token }) {
  const { toast, showToast, hideToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('grid');

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ username: '', email: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Data fetching ───────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true); setError('');
    try {
      setUsers(await getUsers(token));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchUsers(); }, [token]);

  // ── Form handlers ───────────────────────────────────────────────────────────
  const openForm = (user) => {
    setEditTarget(user);
    setForm({ username: user.username, email: user.email });
    setFormError('');
    setFormOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!form.username.trim() || !form.email.trim()) {
      setFormError('Username and email are required.');
      return;
    }
    setSaving(true); setFormError('');
    try {
      await updateUser(editTarget.id, form, token);
      showToast(`${form.username}'s details were updated.`, 'success', 'User Updated');
      setFormOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.message);
      showToast(err.message, 'error', 'Update Failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete handlers ─────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const name = deleteTarget.username;
    try {
      await deleteUser(deleteTarget.id, token);
      setDeleteTarget(null);
      showToast(`${name} was removed.`, 'warning', 'User Removed');
      fetchUsers();
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error', 'Delete Failed');
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box>

      {/* Page header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 4, height: 26, bgcolor: brand.primary, borderRadius: 1 }} />
          <Typography variant="h5" fontWeight={800} color={brand.textPrimary}>Users</Typography>
          {!loading && (
            <Chip
              label={users.length}
              size="small"
              sx={{ bgcolor: brand.primaryLight, color: brand.primaryDark, fontWeight: 700, fontSize: 12 }}
            />
          )}
        </Stack>

        <ToggleButtonGroup
          value={view} exclusive
          onChange={(_, v) => v && setView(v)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': { borderColor: brand.border },
            '& .MuiToggleButton-root.Mui-selected': { bgcolor: brand.primaryLight, color: brand.primaryDark },
          }}
        >
          <ToggleButton value="grid" aria-label="Grid view"><ViewModuleIcon /></ToggleButton>
          <ToggleButton value="table" aria-label="Table view"><TableRowsIcon /></ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Feedback */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: brand.primary }} /></Box>}

      {/* Empty state */}
      {!loading && !error && users.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
          <GroupIcon sx={{ fontSize: 72, color: brand.primaryLight }} />
          <Typography mt={2} fontWeight={600}>No users registered yet.</Typography>
        </Box>
      )}

      {/* ── Grid View ── */}
      {!loading && view === 'grid' && (
        <Grid container spacing={3}>
          {users.map(u => (
            <Grid item xs={12} sm={6} md={4} key={u.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
                  border: `1px solid ${brand.border}`,
                  transition: '0.2s',
                  '&:hover': { boxShadow: '0 6px 22px rgba(0,0,0,0.10)', transform: 'translateY(-3px)' },
                }}
              >
                {/* Top accent strip */}
                <Box sx={{ height: 4, bgcolor: brand.primary, borderRadius: '10px 10px 0 0' }} />
                <CardContent sx={{ pt: 2.5 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: avatarBg(u.username),
                        width: 46, height: 46,
                        fontWeight: 700, fontSize: 18,
                        border: `2px solid ${brand.primaryLight}`,
                      }}
                    >
                      {u.username[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography variant="subtitle1" fontWeight={700} color={brand.textPrimary} noWrap>
                        {u.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>{u.email}</Typography>
                      <Chip
                        label={`Joined ${fmtDate(u.created_at)}`}
                        size="small"
                        sx={{ mt: 0.5, fontSize: 10, bgcolor: brand.primaryLight, color: brand.primaryDark, fontWeight: 600 }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
                <Divider sx={{ borderColor: brand.border }} />
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, py: 1 }}>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => openForm(u)}
                      sx={{ color: brand.primary, '&:hover': { bgcolor: brand.primaryLight } }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(u)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── Table View ── */}
      {!loading && view === 'table' && (
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: `1px solid ${brand.border}` }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar
                        sx={{
                          width: 30, height: 30, fontSize: 13,
                          bgcolor: avatarBg(u.username),
                          border: `2px solid ${brand.primaryLight}`,
                          fontWeight: 700,
                        }}
                      >
                        {u.username[0]?.toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>{u.username}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={fmtDate(u.created_at)}
                      size="small"
                      sx={{ bgcolor: brand.primaryLight, color: brand.primaryDark, fontWeight: 600, fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openForm(u)} sx={{ color: brand.primary }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(u)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── Edit Dialog ── */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 380 } } }}>
        <DialogTitle sx={{ fontWeight: 800, color: brand.textPrimary, borderBottom: `3px solid ${brand.primary}`, pb: 1.5 }}>
          Edit User
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <TextField
            label="Username" fullWidth margin="normal"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            required autoFocus
          />
          <TextField
            label="Email" type="email" fullWidth margin="normal"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setFormOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>Remove User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>{deleteTarget?.username}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined">Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={deleting}>
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Toast Notifications ── */}
      <Toast toast={toast} onClose={hideToast} />
    </Box>
  );
}
