/**
 * pages/AdminSlots.jsx – Admin: create and manage time slots
 */
import { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Table, TableHead, TableRow,
    TableCell, TableBody, Chip, CircularProgress, IconButton, Tooltip,
    Paper, Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { getAllSlots, createSlot, updateSlot } from '../utils/api';
import { fmtTime, fmtDate } from '../utils/format';
import { brand } from '../theme';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

const emptyForm = { slot_date: '', start_time: '', end_time: '', capacity: 20, description: '' };

export default function AdminSlots({ token }) {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const { toast, showToast, hideToast } = useToast();

    const load = useCallback(async () => {
        try {
            const data = await getAllSlots(token);
            setSlots(Array.isArray(data) ? data : []);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { load(); }, [load]);

    const openCreate = () => { setEditId(null); setForm(emptyForm); setOpen(true); };
    const openEdit = (s) => {
        setEditId(s.slot_id);
        setForm({
            slot_date: s.slot_date,
            start_time: s.start_time.slice(0, 5),
            end_time: s.end_time.slice(0, 5),
            capacity: s.max_capacity,
            description: s.description || '',
        });
        setOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Map frontend form field 'capacity' to backend 'max_capacity'
            const payload = { ...form, max_capacity: Number(form.capacity) };
            delete payload.capacity;
            if (editId) {
                await updateSlot(editId, payload, token);
                showToast('Slot updated.', 'success');
            } else {
                await createSlot(payload, token);
                showToast('Slot created.', 'success');
            }
            setOpen(false);
            load();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const field = (key, label, type = 'text', extra = {}) => (
        <TextField
            key={key}
            label={label}
            type={type}
            fullWidth
            margin="normal"
            size="small"
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            slotProps={{ htmlInput: extra }}
        />
    );

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ width: 4, height: 26, bgcolor: brand.primary, borderRadius: 1 }} />
                    <Typography variant="h5" fontWeight={800} color={brand.textPrimary}>Time Slots</Typography>
                </Stack>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
                    New Slot
                </Button>
            </Stack>

            {loading ? (
                <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
            ) : (
                <Paper>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Time</TableCell>
                                <TableCell>Capacity</TableCell>
                                <TableCell>Booked</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {slots.map((s) => (
                                <TableRow key={s.slot_id} hover>
                                    <TableCell>{fmtDate(s.slot_date)}</TableCell>
                                    <TableCell>{fmtTime(s.start_time)} – {fmtTime(s.end_time)}</TableCell>
                                    <TableCell>{s.max_capacity}</TableCell>
                                    <TableCell>{s.booked_count}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={s.is_active ? 'Active' : 'Inactive'}
                                            color={s.is_active ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit">
                                            <IconButton size="small" onClick={() => openEdit(s)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}

            {/* Create / Edit Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>{editId ? 'Edit Slot' : 'New Slot'}</DialogTitle>
                <DialogContent>
                    {field('slot_date', 'Date', 'date')}
                    {field('start_time', 'Start Time', 'time')}
                    {field('end_time', 'End Time', 'time')}
                    {field('capacity', 'Capacity', 'number', { min: 1 })}
                    {field('description', 'Description (optional)')}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        disabled={saving}
                        onClick={handleSave}
                        startIcon={saving ? <CircularProgress size={14} /> : null}
                    >
                        {saving ? 'Saving…' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Toast toast={toast} onClose={hideToast} />
        </Box>
    );
}
