/**
 * pages/AdminQueue.jsx – Admin: live queue management console
 *
 * Shows all appointments for a selected slot and lets staff:
 *  - Mark a student as SERVING (called to counter)
 *  - Mark as SERVED (done)
 *  - Mark as NO_SHOW
 */
import { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, MenuItem, Select, InputLabel, FormControl,
    Table, TableHead, TableRow, TableCell, TableBody, Chip,
    IconButton, Tooltip, CircularProgress, Alert,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckIcon from '@mui/icons-material/Check';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import useSocket from '../hooks/useSocket';
import {
    getAllSlots, getAppointmentsBySlot,
    markServing, markServed, markNoShow,
} from '../utils/api';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

const statusColor = {
    PENDING: 'warning',
    SERVING: 'info',
    SERVED: 'success',
    CANCELLED: 'default',
    NO_SHOW: 'error',
};

export default function AdminQueue({ token }) {
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [loadingAppts, setLoadingAppts] = useState(false);
    const [acting, setActing] = useState(null);
    const { toast, showToast, hideToast } = useToast();

    // Load slots once
    useEffect(() => {
        getAllSlots(token)
            .then((data) => setSlots(Array.isArray(data) ? data : []))
            .catch((err) => showToast(err.message, 'error'))
            .finally(() => setLoadingSlots(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const loadAppointments = useCallback(async (slotId) => {
        setLoadingAppts(true);
        try {
            const data = await getAppointmentsBySlot(slotId, token);
            setAppointments(Array.isArray(data) ? data : []);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoadingAppts(false);
        }
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (selectedSlot) loadAppointments(selectedSlot);
    }, [selectedSlot, loadAppointments]);

    // Live updates when a slot is selected
    useSocket({
        slotId: selectedSlot || null,
        onQueueUpdate: () => selectedSlot && loadAppointments(selectedSlot),
    });

    const act = async (id, fn) => {
        setActing(id);
        try {
            await fn(id, token);
            loadAppointments(selectedSlot);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setActing(null);
        }
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} mb={3}>
                Queue Console
            </Typography>

            {/* Slot selector */}
            {loadingSlots ? (
                <CircularProgress size={24} />
            ) : (
                <FormControl size="small" sx={{ minWidth: 260, mb: 3 }}>
                    <InputLabel>Select Slot</InputLabel>
                    <Select
                        label="Select Slot"
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                    >
                        {slots.map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                                {s.slot_date} &nbsp; {s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {!selectedSlot && !loadingSlots && (
                <Alert severity="info">Select a slot to view its queue.</Alert>
            )}

            {selectedSlot && (
                loadingAppts ? (
                    <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
                ) : appointments.length === 0 ? (
                    <Alert severity="info">No appointments for this slot.</Alert>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Queue No.</TableCell>
                                <TableCell>Student</TableCell>
                                <TableCell>Reason</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {appointments.map((a, i) => (
                                <TableRow key={a.id} hover>
                                    <TableCell>{i + 1}</TableCell>
                                    <TableCell><strong>{a.queue_number}</strong></TableCell>
                                    <TableCell>{a.full_name || a.username}</TableCell>
                                    <TableCell>{a.reason}</TableCell>
                                    <TableCell>
                                        <Chip label={a.status} color={statusColor[a.status] || 'default'} size="small" />
                                    </TableCell>
                                    <TableCell align="center">
                                        {a.status === 'PENDING' && (
                                            <Tooltip title="Call to counter (Serving)">
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        color="info"
                                                        disabled={acting === a.id}
                                                        onClick={() => act(a.id, markServing)}
                                                    >
                                                        {acting === a.id ? <CircularProgress size={14} /> : <PlayArrowIcon fontSize="small" />}
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        )}
                                        {a.status === 'SERVING' && (
                                            <>
                                                <Tooltip title="Mark as Served">
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            disabled={acting === a.id}
                                                            onClick={() => act(a.id, markServed)}
                                                        >
                                                            {acting === a.id ? <CircularProgress size={14} /> : <CheckIcon fontSize="small" />}
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                                <Tooltip title="Mark as No-Show">
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            disabled={acting === a.id}
                                                            onClick={() => act(a.id, markNoShow)}
                                                        >
                                                            <PersonOffIcon fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )
            )}

            <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={hideToast} />
        </Box>
    );
}
