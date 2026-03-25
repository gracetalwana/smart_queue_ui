/**
 * pages/QueueDashboard.jsx – Student: live queue position tracker
 */
import { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Card, CardContent, Chip, CircularProgress,
    Alert, List, ListItem, ListItemText, Divider, Button,
} from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import useSocket from '../hooks/useSocket';
import { getMyAppointments, cancelAppointment } from '../utils/api';
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

    // Active slot: pick the first PENDING or SERVING appointment
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

    // Live updates for the active slot
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
            <Typography variant="h5" fontWeight={700} mb={3}>
                My Queue
            </Typography>

            {/* Active appointment card */}
            {active ? (
                <Card
                    variant="outlined"
                    sx={{
                        mb: 4,
                        borderColor: active.status === 'SERVING' ? 'success.main' : 'primary.main',
                        borderWidth: 2,
                    }}
                >
                    <CardContent>
                        <Typography variant="overline" color="text.secondary">
                            Active Appointment
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2} mt={1} flexWrap="wrap">
                            <Box display="flex" alignItems="center" gap={1}>
                                <ConfirmationNumberIcon color="primary" />
                                <Typography variant="h4" fontWeight={800} color="primary">
                                    {active.queue_number}
                                </Typography>
                            </Box>
                            <Chip label={active.status} color={statusColor[active.status] || 'default'} />
                        </Box>

                        <Typography variant="body2" mt={2}>
                            Slot: {active.slot_date} &nbsp;|&nbsp; {active.start_time} – {active.end_time}
                        </Typography>

                        {active.estimated_wait_minutes !== undefined && (
                            <Box display="flex" alignItems="center" gap={1} mt={1}>
                                <AccessTimeIcon fontSize="small" />
                                <Typography variant="body2">
                                    Estimated wait: ~{active.estimated_wait_minutes} min
                                </Typography>
                            </Box>
                        )}

                        {active.status === 'PENDING' && (
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                sx={{ mt: 2 }}
                                disabled={cancelling === active.id}
                                onClick={() => handleCancel(active.id)}
                            >
                                {cancelling === active.id ? 'Cancelling…' : 'Cancel Appointment'}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Alert severity="info" sx={{ mb: 4 }}>
                    You have no active appointments. Go to <strong>Book Slot</strong> to get in the queue.
                </Alert>
            )}

            {/* History */}
            <Typography variant="h6" fontWeight={600} mb={1}>
                Appointment History
            </Typography>
            {appointments.length === 0 ? (
                <Alert severity="info">No appointments yet.</Alert>
            ) : (
                <List disablePadding>
                    {appointments.map((a, i) => (
                        <Box key={a.id}>
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
                                    primary={`${a.queue_number} — ${a.slot_date}`}
                                    secondary={`${a.start_time} – ${a.end_time}  ·  ${a.reason}`}
                                />
                            </ListItem>
                        </Box>
                    ))}
                </List>
            )}

            <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={hideToast} />
        </Box>
    );
}
