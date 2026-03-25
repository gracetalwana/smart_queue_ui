/**
 * pages/QueueDashboard.jsx – Student: live queue position tracker
 */
import { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Chip, CircularProgress,
    Alert, List, ListItem, ListItemText, Divider, Button, Stack, Paper,
} from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QueueIcon from '@mui/icons-material/HourglassTop';
import useSocket from '../hooks/useSocket';
import { getMyAppointments, cancelAppointment } from '../utils/api';
import { fmtTime, fmtDate } from '../utils/format';
import { brand } from '../theme';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

const statusColor = {
    PENDING: 'warning',
    SERVING: 'info',
    SERVED: 'success',
    CANCELLED: 'default',
    NO_SHOW: 'error',
};

export default function QueueDashboard({ token, user }) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(null);
    const { toast, showToast, hideToast } = useToast();

    const active = appointments.find((a) => ['PENDING', 'SERVING'].includes(a.status));

    const load = useCallback(async () => {
        try {
            const data = await getMyAppointments(token);
            setAppointments(Array.isArray(data) ? data : []);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { load(); }, [load]);

    useSocket({
        slotId: active?.slot_id ?? null,
        userId: user?.id ?? null,
        onQueueUpdate: () => load(),
        onNotification: (n) => showToast(n.message, 'info'),
    });

    const handleCancel = async (id) => {
        setCancelling(id);
        try {
            await cancelAppointment(id, token);
            showToast('Appointment cancelled.', 'success');
            load();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setCancelling(null);
        }
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;
    }

    return (
        <Box>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                <Box sx={{ width: 4, height: 26, bgcolor: brand.primary, borderRadius: 1 }} />
                <Typography variant="h5" fontWeight={800} color={brand.textPrimary}>My Queue</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Track your position in real-time.
            </Typography>

            {/* Active appointment card */}
            {active ? (
                <Paper
                    sx={{
                        mb: 4, p: 3, borderRadius: 3,
                        border: `2px solid ${active.status === 'SERVING' ? brand.success : brand.primary}`,
                        background: active.status === 'SERVING'
                            ? `linear-gradient(135deg, ${brand.successLight} 0%, #fff 100%)`
                            : `linear-gradient(135deg, ${brand.primaryLight} 0%, #fff 100%)`,
                    }}
                >
                    <Typography variant="overline" color="text.secondary" fontWeight={700}>
                        Active Appointment
                    </Typography>
                    <Stack direction="row" alignItems="center" gap={2} mt={1} flexWrap="wrap">
                        <Stack direction="row" alignItems="center" gap={1}>
                            <ConfirmationNumberIcon sx={{ color: brand.primary, fontSize: 28 }} />
                            <Typography variant="h3" fontWeight={900} color={brand.primary}>
                                {active.queue_number}
                            </Typography>
                        </Stack>
                        <Chip label={active.status} color={statusColor[active.status] || 'default'} />
                    </Stack>

                    <Typography variant="body2" mt={2} color="text.secondary">
                        {fmtDate(active.slot_date)} &nbsp;|&nbsp; {fmtTime(active.start_time)} – {fmtTime(active.end_time)}
                    </Typography>

                    {active.estimated_wait_minutes !== undefined && (
                        <Stack direction="row" alignItems="center" gap={1} mt={1}>
                            <AccessTimeIcon fontSize="small" sx={{ color: brand.warning }} />
                            <Typography variant="body2" fontWeight={600}>
                                Estimated wait: ~{active.estimated_wait_minutes} min
                            </Typography>
                        </Stack>
                    )}

                    {active.status === 'PENDING' && (
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            sx={{ mt: 2 }}
                            disabled={cancelling === active.appointment_id}
                            onClick={() => handleCancel(active.appointment_id)}
                        >
                            {cancelling === active.appointment_id ? 'Cancelling…' : 'Cancel Appointment'}
                        </Button>
                    )}
                </Paper>
            ) : (
                <Alert severity="info" icon={<QueueIcon />} sx={{ mb: 4, borderRadius: 3 }}>
                    You have no active appointments. Go to <strong>Book Slot</strong> to get in the queue.
                </Alert>
            )}

            {/* History */}
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <Box sx={{ width: 4, height: 20, bgcolor: brand.accent, borderRadius: 1 }} />
                <Typography variant="h6" fontWeight={700}>Appointment History</Typography>
            </Stack>

            {appointments.length === 0 ? (
                <Alert severity="info">No appointments yet.</Alert>
            ) : (
                <Paper>
                    <List disablePadding>
                        {appointments.map((a, i) => (
                            <Box key={a.appointment_id}>
                                {i > 0 && <Divider />}
                                <ListItem
                                    secondaryAction={
                                        <Chip
                                            label={a.status}
                                            color={statusColor[a.status] || 'default'}
                                            size="small"
                                        />
                                    }
                                >
                                    <ListItemText
                                        primary={
                                            <Typography fontWeight={600}>
                                                #{a.queue_number} — {fmtDate(a.slot_date)}
                                            </Typography>
                                        }
                                        secondary={`${fmtTime(a.start_time)} – ${fmtTime(a.end_time)}  ·  ${a.reason}`}
                                    />
                                </ListItem>
                            </Box>
                        ))}
                    </List>
                </Paper>
            )}

            <Toast toast={toast} onClose={hideToast} />
        </Box>
    );
}
