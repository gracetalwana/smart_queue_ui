/**
 * pages/Reports.jsx — Smart Queuing System Analytics & Reports
 *
 * Displays queue analytics: KPI cards, appointments by status (donut),
 * daily volume (bar), appointments by reason (donut), and recent appointments table.
 */
import { useEffect, useState } from 'react';
import { getQueueStats } from '../utils/api';
import { fmtDateTime } from '../utils/format';
import {
    Box, Typography, Stack, Paper, Grid, Chip, CircularProgress,
    Alert, Divider, Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Avatar, LinearProgress,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ReactApexChart from 'react-apexcharts';

const UCU = {
    maroon: '#7B1C1C',
    maroonDark: '#5C1010',
    gold: '#C9A227',
    goldLight: '#F5E6B0',
    white: '#FFFFFF',
};

const STATUS_META = {
    PENDING: { label: 'Pending', color: '#E65100', bg: '#FBE9E7', icon: <HourglassTopIcon sx={{ fontSize: 20 }} /> },
    SERVING: { label: 'Serving', color: '#1A4A7B', bg: '#E8F4FD', icon: <ConfirmationNumberIcon sx={{ fontSize: 20 }} /> },
    SERVED: { label: 'Served', color: '#1A5C2E', bg: '#E6F4EA', icon: <CheckCircleIcon sx={{ fontSize: 20 }} /> },
    CANCELLED: { label: 'Cancelled', color: '#888', bg: '#F5F5F5', icon: <ReportProblemIcon sx={{ fontSize: 20 }} /> },
    NO_SHOW: { label: 'No-Show', color: '#7B1C1C', bg: '#FDF2F2', icon: <ReportProblemIcon sx={{ fontSize: 20 }} /> },
};

const REASON_META = {
    general: { label: 'General', color: '#1A4A7B', bg: '#E8F4FD' },
    billing: { label: 'Billing', color: '#1A5C2E', bg: '#E6F4EA' },
    transcript: { label: 'Transcript', color: '#6A1B9A', bg: '#F3E5F5' },
    other: { label: 'Other', color: '#E65100', bg: '#FBE9E7' },
};

const statusCount = (arr, status) =>
    Number((arr ?? []).find(r => r.status === status)?.count ?? 0);

// ── KPI Card ──
const KpiCard = ({ icon, label, value, accent, lightBg, sub }) => (
    <Paper sx={{
        p: 0, borderRadius: 3, flex: 1, overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
    }}>
        <Box sx={{ height: 3, bgcolor: accent }} />
        <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 2.5 }}>
            <Box sx={{ bgcolor: lightBg, borderRadius: 2.5, p: 1.5, color: accent, flexShrink: 0 }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="h4" fontWeight={900} color={accent} lineHeight={1.1}>
                    {value ?? <CircularProgress size={22} sx={{ color: accent }} />}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>{label}</Typography>
                {sub && <Typography variant="caption" color="text.disabled" display="block">{sub}</Typography>}
            </Box>
        </Stack>
    </Paper>
);

// ── Component ──
export default function Reports({ token }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                setStats(await getQueueStats(token));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    if (loading) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 12 }}>
            <CircularProgress sx={{ color: UCU.maroon }} size={44} thickness={3} />
            <Typography variant="body2" color="text.secondary">Loading analytics…</Typography>
        </Box>
    );

    if (error) return <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>;

    const totalAppts = Number(stats?.totalAppointments ?? 0);
    const totalUsers = Number(stats?.totalUsers ?? 0);
    const todayTotal = Number(stats?.todayTotal ?? 0);
    const served = statusCount(stats?.byStatus, 'SERVED');
    const total = totalAppts || 1;
    const servRate = Math.round((served / total) * 100);
    const noShowCount = statusCount(stats?.byStatus, 'NO_SHOW');
    const noShowRate = Math.round((noShowCount / total) * 100);

    // ── Status donut ──
    const donutData = Object.keys(STATUS_META).map(s => ({
        status: s, count: statusCount(stats?.byStatus, s),
    })).filter(d => d.count > 0);

    const donutSeries = donutData.map(d => d.count);
    const donutLabels = donutData.map(d => STATUS_META[d.status].label);
    const donutColors = donutData.map(d => STATUS_META[d.status].color);

    const donutOptions = {
        chart: { type: 'donut', toolbar: { show: false }, animations: { enabled: true, speed: 600 } },
        labels: donutLabels, colors: donutColors,
        dataLabels: { enabled: true, formatter: (val) => `${Math.round(val)}%`, style: { fontSize: '12px', fontWeight: 800 }, dropShadow: { enabled: false } },
        plotOptions: { pie: { donut: { size: '60%', labels: { show: true, total: { show: true, label: 'Total', fontSize: '13px', fontWeight: 700, color: '#555', formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0) } } } } },
        legend: { position: 'bottom', fontSize: '12px', fontWeight: 600, markers: { width: 10, height: 10, radius: 5 }, itemMargin: { horizontal: 8, vertical: 4 } },
        stroke: { width: 2 },
        tooltip: { y: { formatter: (val) => `${val} appointment${val === 1 ? '' : 's'}` } },
    };

    // ── Reason donut ──
    const reasonData = (stats?.byReason ?? []).filter(r => Number(r.count) > 0);
    const reasonSeries = reasonData.map(r => Number(r.count));
    const reasonLabels = reasonData.map(r => REASON_META[r.reason]?.label ?? r.reason);
    const reasonColors = reasonData.map(r => REASON_META[r.reason]?.color ?? '#999');

    const reasonDonutOptions = {
        ...donutOptions,
        labels: reasonLabels,
        colors: reasonColors,
        tooltip: { y: { formatter: (val) => `${val} appointment${val === 1 ? '' : 's'}` } },
    };

    // ── Daily volume bar ──
    const dailyVolume = stats?.dailyVolume ?? [];
    const barCategories = dailyVolume.map(r => {
        const d = new Date(r.date);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    });
    const barSeries = [{ name: 'Appointments', data: dailyVolume.map(r => Number(r.count)) }];

    const barOptions = {
        chart: { type: 'bar', toolbar: { show: false }, animations: { enabled: true, speed: 600 } },
        plotOptions: { bar: { borderRadius: 6, columnWidth: '55%', dataLabels: { position: 'top' } } },
        dataLabels: { enabled: true, offsetY: -20, style: { fontSize: '11px', fontWeight: 700, colors: [UCU.maroon] } },
        xaxis: { categories: barCategories, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: '11px', colors: '#777' }, rotate: -25, rotateAlways: true } },
        yaxis: { labels: { style: { fontSize: '11px', colors: '#aaa' } } },
        colors: [UCU.maroon],
        grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4, yaxis: { lines: { show: true } }, xaxis: { lines: { show: false } } },
        tooltip: { y: { formatter: (val) => `${val} appointment${val === 1 ? '' : 's'}` } },
        legend: { show: false },
    };

    return (
        <Box sx={{ width: '100%' }}>

            {/* ── Page header ── */}
            <Box
                sx={{
                    mb: 3.5, borderRadius: 3, overflow: 'hidden',
                    background: `linear-gradient(135deg, ${UCU.maroon} 0%, #A52828 100%)`,
                    p: { xs: 2.5, md: 3 },
                    boxShadow: '0 4px 20px rgba(123,28,28,0.28)',
                    position: 'relative',
                }}
            >
                <Box sx={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle at 20px 20px, white 1.5px, transparent 0)', backgroundSize: '36px 36px' }} />
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(201,162,39,0.18)', filter: 'blur(35px)' }} />
                <Stack direction="row" alignItems="center" spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2, p: 1.2 }}>
                        <AssessmentIcon sx={{ color: UCU.gold, fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight={900} color={UCU.white}>Reports & Analytics</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
                            Comprehensive overview of your Smart Queuing System data
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            {/* ── KPI Row ── */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3.5} flexWrap="wrap" useFlexGap sx={{ width: '100%' }}>
                <KpiCard icon={<ConfirmationNumberIcon />} label="Total Appointments" value={totalAppts} accent={UCU.maroon} lightBg="#FDF2F2" sub="All time" />
                <KpiCard icon={<PeopleAltIcon />} label="Registered Users" value={totalUsers} accent="#1A4A7B" lightBg="#EEF4FB" sub="All accounts" />
                <KpiCard icon={<EventAvailableIcon />} label="Today's Bookings" value={todayTotal} accent="#1A5C2E" lightBg="#EEF8F1" sub="Booked today" />
            </Stack>

            {/* ── Charts row 1: status donut + daily volume bar ── */}
            <Grid container spacing={3} mb={3.5}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden', height: '100%' }}>
                        <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
                            <Typography variant="subtitle2" fontWeight={800}>Appointments by Status</Typography>
                            <Typography variant="caption" color="text.disabled">All-time status breakdown</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ p: 1 }}>
                            {donutSeries.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" textAlign="center" py={6}>No data available</Typography>
                            ) : (
                                <ReactApexChart type="donut" series={donutSeries} options={donutOptions} height={340} />
                            )}
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden', height: '100%' }}>
                        <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
                            <Typography variant="subtitle2" fontWeight={800}>Daily Appointment Volume</Typography>
                            <Typography variant="caption" color="text.disabled">Last 14 days</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ p: 1 }}>
                            {barSeries[0].data.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" textAlign="center" py={8}>No volume data</Typography>
                            ) : (
                                <ReactApexChart type="bar" series={barSeries} options={barOptions} height={340} />
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* ── Bottom row: service rate panel + reason breakdown + recent table ── */}
            <Grid container spacing={3}>

                {/* Service rate / no-show panel */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
                            <Typography variant="subtitle2" fontWeight={800}>Performance</Typography>
                            <Typography variant="caption" color="text.disabled">Service rate &amp; no-show rate</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ p: 2.5 }}>
                            <Grid container spacing={2} mb={2.5}>
                                {[
                                    { label: 'Served', count: served, color: '#1A5C2E', bg: '#E6F4EA', icon: <CheckCircleIcon sx={{ fontSize: 20 }} /> },
                                    { label: 'No-Show', count: noShowCount, color: '#7B1C1C', bg: '#FDF2F2', icon: <ReportProblemIcon sx={{ fontSize: 20 }} /> },
                                ].map(s => (
                                    <Grid item xs={6} key={s.label}>
                                        <Box sx={{ bgcolor: s.bg, borderRadius: 2.5, p: 2, textAlign: 'center' }}>
                                            <Box sx={{ color: s.color, mb: 0.5 }}>{s.icon}</Box>
                                            <Typography variant="h4" fontWeight={900} color={s.color}>{s.count}</Typography>
                                            <Typography variant="caption" color={s.color} fontWeight={600}>{s.label}</Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>

                            <Stack spacing={2}>
                                {[
                                    { label: 'Service Rate', pct: servRate, color: '#1A5C2E' },
                                    { label: 'No-Show Rate', pct: noShowRate, color: UCU.maroon },
                                ].map(r => (
                                    <Box key={r.label}>
                                        <Stack direction="row" justifyContent="space-between" mb={0.6}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>{r.label}</Typography>
                                            <Typography variant="caption" fontWeight={800} color={r.color}>{r.pct}%</Typography>
                                        </Stack>
                                        <LinearProgress variant="determinate" value={r.pct}
                                            sx={{
                                                height: 8, borderRadius: 4, bgcolor: `${r.color}18`,
                                                '& .MuiLinearProgress-bar': { bgcolor: r.color, borderRadius: 4 },
                                            }} />
                                    </Box>
                                ))}
                            </Stack>

                            {/* Reason breakdown mini-donut */}
                            {reasonSeries.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="subtitle2" fontWeight={800} mb={1}>By Reason</Typography>
                                    <ReactApexChart type="donut" series={reasonSeries} options={reasonDonutOptions} height={220} />
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Recent appointments table */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
                            <Typography variant="subtitle2" fontWeight={800}>Recent Appointments</Typography>
                            <Typography variant="caption" color="text.disabled">Last 10 bookings</Typography>
                        </Box>
                        <Divider />
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                        {['Queue #', 'Student', 'Reason', 'Status', 'Booked'].map(h => (
                                            <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, py: 1.5 }}>{h}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(stats?.recent ?? []).map((appt) => {
                                        const meta = STATUS_META[appt.status] ?? { label: appt.status, color: '#777', bg: '#eee' };
                                        const rmeta = REASON_META[appt.reason] ?? { label: appt.reason, color: '#777', bg: '#eee' };
                                        return (
                                            <TableRow key={appt.appointment_id} hover
                                                sx={{ '&:last-child td': { border: 0 }, transition: '0.15s', '&:hover': { bgcolor: 'rgba(123,28,28,0.02)' } }}>
                                                <TableCell>
                                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                                        <Avatar sx={{ bgcolor: meta.bg, color: meta.color, width: 32, height: 32 }}>
                                                            <ConfirmationNumberIcon sx={{ fontSize: 15 }} />
                                                        </Avatar>
                                                        <Typography variant="body2" fontWeight={700}>{appt.queue_number}</Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600}>{appt.full_name || appt.username}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={rmeta.label} size="small"
                                                        sx={{ bgcolor: rmeta.bg, color: rmeta.color, fontWeight: 700, fontSize: 10, height: 20, textTransform: 'capitalize' }} />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={meta.label} size="small"
                                                        sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 600, fontSize: 10, height: 20 }} />
                                                </TableCell>
                                                <TableCell sx={{ color: 'text.secondary', fontSize: 12, whiteSpace: 'nowrap' }}>
                                                    {appt.booked_at
                                                        ? fmtDateTime(appt.booked_at)
                                                        : '—'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {(!stats?.recent || stats.recent.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary', py: 4 }}>No appointment data yet</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
