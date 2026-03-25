/**
 * pages/BookSlot.jsx – Student: browse and book available time slots
 */
import { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, CardActions,
    Button, Chip, TextField, CircularProgress, Alert, Paper, Stack, LinearProgress,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { getSlots, bookAppointment } from '../utils/api';
import { fmtTime, fmtDate } from '../utils/format';
import { brand } from '../theme';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

export default function BookSlot({ token }) {
    const today = new Date().toISOString().slice(0, 10);
    const [date, setDate] = useState(today);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(null);
    const { toast, showToast, hideToast } = useToast();

    const loadSlots = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getSlots(token, date);
            setSlots(Array.isArray(data) ? data : []);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [token, date]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { loadSlots(); }, [loadSlots]);

    const handleBook = async (slotId) => {
        setBooking(slotId);
        try {
            const res = await bookAppointment({ slot_id: slotId, reason: 'general' }, token);
            showToast(`Booked! Your queue number is ${res.queue_number} 🎉`, 'success');
            loadSlots();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setBooking(null);
        }
    };

    const remaining = (s) => s.max_capacity - (s.booked_count || 0);
    const pct = (s) => Math.round(((s.booked_count || 0) / s.max_capacity) * 100);

    return (
        <Box>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                <Box sx={{ width: 4, height: 26, bgcolor: brand.primary, borderRadius: 1 }} />
                <Typography variant="h5" fontWeight={800} color={brand.textPrimary}>
                    Book an Appointment
                </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Choose a date and select an available slot.
            </Typography>

            {/* Date picker */}
            <Paper sx={{ p: 2, mb: 3, display: 'inline-flex' }}>
                <TextField
                    type="date"
                    label="Select Date"
                    InputLabelProps={{ shrink: true }}
                    value={date}
                    inputProps={{ min: today }}
                    onChange={(e) => setDate(e.target.value)}
                    size="small"
                />
            </Paper>

            {loading ? (
                <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
            ) : slots.length === 0 ? (
                <Alert severity="info" icon={<EventAvailableIcon />} sx={{ borderRadius: 3 }}>
                    No available slots for {fmtDate(date)}.
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {slots.map((slot) => {
                        const left = remaining(slot);
                        const full = left <= 0;
                        const fill = pct(slot);
                        return (
                            <Grid item xs={12} sm={6} md={4} key={slot.slot_id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: full ? 0.6 : 1 }}>
                                    {/* Top accent */}
                                    <Box sx={{ height: 4, bgcolor: full ? brand.error : brand.primary, borderRadius: '16px 16px 0 0' }} />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                                            <CalendarMonthIcon fontSize="small" sx={{ color: brand.primary }} />
                                            <Typography fontWeight={700}>{fmtDate(slot.slot_date)}</Typography>
                                        </Stack>
                                        <Stack direction="row" alignItems="center" gap={1} mb={1}>
                                            <AccessTimeIcon fontSize="small" sx={{ color: brand.textSecondary }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {fmtTime(slot.start_time)} – {fmtTime(slot.end_time)}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                                            <PeopleIcon fontSize="small" sx={{ color: brand.textSecondary }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {left} / {slot.max_capacity} spots left
                                            </Typography>
                                        </Stack>
                                        {/* Capacity bar */}
                                        <LinearProgress
                                            variant="determinate"
                                            value={fill}
                                            sx={{
                                                height: 6, borderRadius: 3,
                                                bgcolor: `${full ? brand.error : brand.primary}15`,
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: full ? brand.error : fill > 75 ? brand.warning : brand.primary,
                                                    borderRadius: 3,
                                                },
                                            }}
                                        />
                                        {slot.description && (
                                            <Typography variant="caption" color="text.secondary" mt={1.5} display="block">
                                                {slot.description}
                                            </Typography>
                                        )}
                                    </CardContent>
                                    <CardActions sx={{ px: 2, pb: 2 }}>
                                        {full ? (
                                            <Chip label="Full" color="error" size="small" />
                                        ) : (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                disabled={booking === slot.slot_id}
                                                onClick={() => handleBook(slot.slot_id)}
                                                startIcon={booking === slot.slot_id ? <CircularProgress size={14} /> : null}
                                            >
                                                {booking === slot.slot_id ? 'Booking…' : 'Book Now'}
                                            </Button>
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            <Toast toast={toast} onClose={hideToast} />
        </Box>
    );
}
