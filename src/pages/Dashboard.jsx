import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Paper, Stack, Chip, Skeleton, Button,
  CircularProgress, Avatar, Divider,
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  CheckCircle as CheckIcon,
  HourglassTop as QueueIcon,
  ReportProblem as ReportProblemIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { getQueueStats } from '../utils/api';
import { fmtTime, fmtDate } from '../utils/format';
import { brand } from '../theme';

const STATUS_META = {
  PENDING: { label: 'Pending', color: brand.warning, bg: brand.warningLight },
  SERVING: { label: 'Serving', color: brand.info, bg: brand.infoLight },
  SERVED: { label: 'Served', color: brand.success, bg: brand.successLight },
  CANCELLED: { label: 'Cancelled', color: brand.error, bg: brand.errorLight },
  NO_SHOW: { label: 'No-Show', color: brand.textSecondary, bg: '#F1F5F9' },
};

export default function Dashboard() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getQueueStats(token)
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [token]);

  const todayByStatus = stats?.todayByStatus || [];
  const todayServed = todayByStatus.find((r) => r.status === 'SERVED')?.count || 0;
  const todayPending = todayByStatus.find((r) => r.status === 'PENDING')?.count || 0;
  const todayNoShow = todayByStatus.find((r) => r.status === 'NO_SHOW')?.count || 0;
  const todayTotal = Number(stats?.todayTotal ?? 0);

  const kpiCards = [
    {
      label: "Today's Appointments",
      value: loading ? null : todayTotal,
      icon: <PeopleIcon sx={{ fontSize: 32 }} />,
      accent: brand.primary, lightBg: brand.primaryLight,
      trend: 'All statuses', link: null,
    },
    {
      label: 'Served Today',
      value: loading ? null : todayServed,
      icon: <CheckIcon sx={{ fontSize: 32 }} />,
      accent: '#10B981', lightBg: '#E6F9F0',
      trend: 'Completed', link: null,
    },
    {
      label: 'In Queue',
      value: loading ? null : todayPending,
      icon: <QueueIcon sx={{ fontSize: 32 }} />,
      accent: brand.warning, lightBg: brand.warningLight,
      trend: 'Waiting now', link: '/admin/queue',
    },
    {
      label: 'No-Shows',
      value: loading ? null : todayNoShow,
      icon: <ReportProblemIcon sx={{ fontSize: 32 }} />,
      accent: '#EF4444', lightBg: '#FEE2E2',
      trend: 'Missed today', link: null,
    },
  ];

  const donutData = (stats?.byStatus || [])
    .map((r) => ({ status: r.status, count: Number(r.count) }))
    .filter((d) => d.count > 0);
  const donutSeries = donutData.map((d) => d.count);
  const donutLabels = donutData.map((d) => STATUS_META[d.status]?.label || d.status);
  const donutColors = donutData.map((d) => STATUS_META[d.status]?.color || '#999');

  const dailyDates = (stats?.dailyVolume || []).map((r) => {
    const d = new Date(r.date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });
  const dailyCounts = (stats?.dailyVolume || []).map((r) => Number(r.count));

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Hero */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 }, mb: 4, borderRadius: 4,
          background: `linear-gradient(135deg, ${brand.sidebarBg} 0%, ${brand.primaryDark} 100%)`,
          color: '#fff', position: 'relative', overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Smart Queuing System
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.85 }}>
              Monitor appointments, queues, and service performance in real-time.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={() => navigate('/book-slot')}
              sx={{ bgcolor: brand.accent, color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#7C3AED' } }}>
              Book Slot
            </Button>
            <Button variant="outlined" onClick={() => navigate('/reports')}
              sx={{ borderColor: 'rgba(255,255,255,.4)', color: '#fff', '&:hover': { borderColor: '#fff' } }}>
              Reports
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiCards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
            <Paper
              elevation={0}
              onClick={() => card.link && navigate(card.link)}
              sx={{
                p: 3, borderRadius: 3, cursor: card.link ? 'pointer' : 'default',
                border: '1px solid', borderColor: 'divider',
                transition: 'box-shadow .2s', '&:hover': card.link ? { boxShadow: 4 } : {},
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    {card.label}
                  </Typography>
                  {card.value !== null ? (
                    <Typography variant="h3" fontWeight={800} sx={{ color: card.accent, mt: 0.5 }}>
                      {card.value}
                    </Typography>
                  ) : (
                    <Skeleton width={60} height={48} />
                  )}
                  <Typography variant="caption" color="text.secondary">{card.trend}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: card.lightBg, color: card.accent, width: 48, height: 48 }}>
                  {card.icon}
                </Avatar>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Donut */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Appointments by Status</Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
            ) : donutSeries.length ? (
              <Chart
                type="donut"
                height={300}
                series={donutSeries}
                options={{
                  labels: donutLabels,
                  colors: donutColors,
                  legend: { position: 'bottom' },
                  stroke: { width: 2 },
                  dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(0)}%` },
                }}
              />
            ) : (
              <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>No data yet</Typography>
            )}
          </Paper>
        </Grid>

        {/* Bar */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Daily Appointment Volume</Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
            ) : dailyCounts.length ? (
              <Chart
                type="bar"
                height={300}
                series={[{ name: 'Appointments', data: dailyCounts }]}
                options={{
                  chart: { toolbar: { show: false } },
                  xaxis: { categories: dailyDates },
                  colors: [brand.primary],
                  plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
                  dataLabels: { enabled: false },
                  tooltip: { y: { formatter: (val) => `${val} appointment${val !== 1 ? 's' : ''}` } },
                }}
              />
            ) : (
              <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>No data yet</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Appointments */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>Recent Appointments</Typography>
          <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/reports')}
            sx={{ color: brand.primary, fontWeight: 600 }}>
            View All
          </Button>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {loading ? (
          <Stack spacing={2}>{[1, 2, 3].map((i) => <Skeleton key={i} height={48} />)}</Stack>
        ) : (stats?.recent || []).length ? (
          <Stack spacing={1}>
            {(stats.recent || []).map((appt) => {
              const meta = STATUS_META[appt.status] || {};
              return (
                <Stack key={appt.appointment_id} direction="row" alignItems="center" spacing={2}
                  sx={{ p: 1.5, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                  <Avatar sx={{ bgcolor: meta.bg || '#eee', color: meta.color || '#333', width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
                    {appt.queue_number || '#'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{appt.full_name || appt.username || 'Student'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {fmtDate(appt.slot_date)} &middot; {fmtTime(appt.start_time)}&ndash;{fmtTime(appt.end_time)}
                    </Typography>
                  </Box>
                  <Chip label={appt.reason || 'General'} size="small" sx={{ bgcolor: brand.primaryLight, color: brand.primaryDark, fontWeight: 600, fontSize: 11 }} />
                  <Chip label={meta.label || appt.status} size="small"
                    sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 700, fontSize: 11 }} />
                </Stack>
              );
            })}
          </Stack>
        ) : (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No appointments found</Typography>
        )}
      </Paper>
    </Box>
  );
}
