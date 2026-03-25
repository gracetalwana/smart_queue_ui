/**
 * theme.js — Modern Smart Queue System Theme
 *
 * A clean, professional palette built around deep indigo (#1E293B) and
 * vibrant teal (#0EA5E9) — feels modern and trustworthy for both
 * students and staff. Warm neutral backgrounds keep it friendly.
 */
import { createTheme, alpha } from '@mui/material/styles';

// ── Brand tokens ──────────────────────────────────────────────────────────────
export const brand = {
    // Primary
    primary: '#0EA5E9',   // sky-500 — buttons, links, active states
    primaryDark: '#0284C7',   // sky-600 — hover
    primaryLight: '#E0F2FE',   // sky-100 — subtle bg

    // Secondary / accent
    accent: '#8B5CF6',   // violet-500
    accentLight: '#EDE9FE',   // violet-100

    // Sidebar
    sidebarBg: '#0F172A',   // slate-900
    sidebarHover: '#1E293B',   // slate-800

    // Neutrals
    bgDefault: '#F8FAFC',   // slate-50 — page background
    bgPaper: '#FFFFFF',
    textPrimary: '#0F172A',   // slate-900
    textSecondary: '#64748B',   // slate-500
    border: '#E2E8F0',   // slate-200

    // Status colors
    success: '#10B981',   // emerald-500
    successLight: '#ECFDF5',
    warning: '#F59E0B',   // amber-500
    warningLight: '#FFFBEB',
    error: '#EF4444',   // red-500
    errorLight: '#FEF2F2',
    info: '#3B82F6',   // blue-500
    infoLight: '#EFF6FF',
};

const theme = createTheme({
    palette: {
        primary: { main: brand.primary, dark: brand.primaryDark, light: brand.primaryLight, contrastText: '#fff' },
        secondary: { main: brand.accent, light: brand.accentLight, contrastText: '#fff' },
        success: { main: brand.success, light: brand.successLight },
        warning: { main: brand.warning, light: brand.warningLight },
        error: { main: brand.error, light: brand.errorLight },
        info: { main: brand.info, light: brand.infoLight },
        background: { default: brand.bgDefault, paper: brand.bgPaper },
        text: { primary: brand.textPrimary, secondary: brand.textSecondary },
        divider: brand.border,
    },

    typography: {
        fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
        h4: { fontWeight: 800, letterSpacing: '-0.02em' },
        h5: { fontWeight: 700, letterSpacing: '-0.01em' },
        h6: { fontWeight: 700 },
        subtitle1: { fontWeight: 600 },
        body2: { lineHeight: 1.6 },
        caption: { lineHeight: 1.5 },
    },

    shape: { borderRadius: 12 },

    shadows: [
        'none',
        '0 1px 2px rgba(0,0,0,0.04)',
        '0 1px 4px rgba(0,0,0,0.06)',
        '0 2px 8px rgba(0,0,0,0.06)',
        '0 4px 12px rgba(0,0,0,0.07)',
        '0 6px 16px rgba(0,0,0,0.08)',
        '0 8px 24px rgba(0,0,0,0.09)',
        '0 12px 32px rgba(0,0,0,0.10)',
        ...new Array(17).fill('0 12px 32px rgba(0,0,0,0.10)'),
    ],

    components: {
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 10,
                    padding: '8px 20px',
                },
                containedPrimary: {
                    background: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%)`,
                    '&:hover': { background: `linear-gradient(135deg, ${brand.primaryDark} 0%, #0369A1 100%)` },
                },
            },
        },
        MuiPaper: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    border: `1px solid ${brand.border}`,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: `1px solid ${brand.border}`,
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                    '&:hover': {
                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                        transform: 'translateY(-2px)',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 600, fontSize: 12 },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: brand.primary,
                        borderWidth: 2,
                    },
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-root': {
                        fontWeight: 700,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: brand.textSecondary,
                        borderBottom: `2px solid ${brand.border}`,
                        backgroundColor: brand.bgDefault,
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': { backgroundColor: alpha(brand.primary, 0.03) },
                    '&:last-child td': { borderBottom: 0 },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: { borderRadius: 16, border: `1px solid ${brand.border}` },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: { borderRadius: 12 },
            },
        },
    },
});

export default theme;
