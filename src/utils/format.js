/**
 * utils/format.js – Date and time formatting helpers
 */

/**
 * Format a MySQL TIME value (e.g. "09:00:00") into "9:00 AM".
 * Returns the raw value if parsing fails.
 */
export function fmtTime(timeStr) {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let h = Number.parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return `${h}:${m} ${ampm}`;
}

/**
 * Format a date value (ISO string or "YYYY-MM-DD") into "25 Mar 2026".
 * Returns the raw value if parsing fails.
 */
export function fmtDate(dateVal) {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (Number.isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Format a datetime value (ISO string) into "25 Mar 2026, 9:00 AM".
 */
export function fmtDateTime(datetimeVal) {
    if (!datetimeVal) return '';
    const d = new Date(datetimeVal);
    if (Number.isNaN(d.getTime())) return String(datetimeVal);
    return d.toLocaleString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
    });
}
