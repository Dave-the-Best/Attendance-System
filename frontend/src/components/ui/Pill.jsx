// Status badge. Class is derived from the (lowercased) status so the CSS
// pill-<status> rules apply consistently across the app.
export default function Pill({ status }) {
  const key = String(status || 'idle').toLowerCase();
  return <span className={`pill pill-${key}`}>{status}</span>;
}
