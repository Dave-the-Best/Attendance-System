// Shared date/time helpers.
// Backend stores dates that arrive as either ISO strings or epoch-millis strings,
// so `new Date(Number(d) || d)` handles both consistently.

const toDate = (d) => (d == null ? null : new Date(Number(d) || d));

export const fmtTime = (d) => {
  const date = toDate(d);
  return date && !isNaN(date) ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
};

export const fmtDate = (d) => {
  const date = toDate(d);
  return date && !isNaN(date) ? date.toLocaleDateString() : '—';
};

export const fmtDateLong = (d) => {
  const date = toDate(d);
  return date && !isNaN(date)
    ? date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : '—';
};

// A YYYY-MM-DD "date" string (attendance.date) -> Date at local midnight.
const dayToDate = (s) => {
  if (!s) return null;
  const d = toDate(s);
  return d && !isNaN(d) ? d : null;
};

export const isSameMonth = (dateStr, ref = new Date()) => {
  const d = dayToDate(dateStr);
  return !!d && d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
};

export const isThisWeek = (dateStr, ref = new Date()) => {
  const d = dayToDate(dateStr);
  if (!d) return false;
  const start = new Date(ref);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // Monday
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return d >= start && d < end;
};

// Inclusive whole-day span between two date inputs.
export const daysBetween = (start, end) => {
  const a = toDate(start);
  const b = toDate(end);
  if (!a || !b || isNaN(a) || isNaN(b)) return 0;
  const ms = new Date(b).setHours(0, 0, 0, 0) - new Date(a).setHours(0, 0, 0, 0);
  return Math.floor(ms / 86400000) + 1;
};

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || '?';

export const greeting = (d = new Date()) => {
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

// Simple, dependency-free CSV export.
export const downloadCSV = (filename, rows) => {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
