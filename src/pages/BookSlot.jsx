/**
 * pages/BookSlot.jsx – Student: browse and book available time slots
 */
import { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, CardActions,
    Button, Chip, TextField, CircularProgress, Alert,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import { getSlots, bookAppointment } from '../utils/api';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

export default function BookSlot({ token }) {
    const today = new Date().toISOString().slice(0, 10);
    const [date, setDate] = useState(today);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(null); // id being booked
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

    const remaining = (s) => s.capacity - (s.booked_count || 0);

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} mb={3}>
                Book an Appointment
            </Typography>

            {/* Date picker */}
            <Box mb={3}>
                <TextField
                    type="date"
                    label="Select Date"
                    InputLabelProps={{ shrink: true }}
                    value={date}
                    inputProps={{ min: today }}
                    onChange={(e) => setDate(e.target.value)}
                    size="small"
                />
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
            ) : slots.length === 0 ? (
                <Alert severity="info">No available slots for {date}.</Alert>
            ) : (
                <Grid container spacing={3}>
                    {slots.map((slot) => {
                        const left = remaining(slot);
                        const full = left <= 0;
                        return (
                            <Grid item xs={12} sm={6} md={4} key={slot.id}>
                                <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <CalendarMonthIcon fontSize="small" color="primary" />
                                            <Typography fontWeight={600}>{slot.slot_date}</Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <AccessTimeIcon fontSize="small" />
                                            <Typography variant="body2">
                                                {slot.start_time} – {slot.end_time}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <PeopleIcon fontSize="small" />
                                            <Typography variant="body2">
                                                {left} / {slot.capacity} spots left
                                            </Typography>
                                        </Box>
                                        {slot.description && (
                                            <Typography variant="caption" color="text.secondary" mt={1} display="block">
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
                                                disabled={booking === slot.id}
                                                onClick={() => handleBook(slot.id)}
                                                startIcon={booking === slot.id ? <CircularProgress size={14} /> : null}
                                            >
                                                {booking === slot.id ? 'Booking…' : 'Book Now'}
                                            </Button>
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={hideToast} />
        </Box>
    );
}
