import {
  Check, X, Clock, Hourglass, CalendarDays, Home, ShieldCheck, User, LogOut, CircleDot,
} from 'lucide-react';

// Status badge. Conveys status by colour + icon + text label (never colour
// alone — WCAG). The pill-<status> CSS class supplies the colour treatment.
const ICONS = {
  present: Check, approved: Check, completed: Check,
  late: Clock, working: Clock,
  pending: Hourglass,
  absent: X, rejected: X,
  early: LogOut, 'early-departure': LogOut,
  remote: Home, annual: CalendarDays, sick: CalendarDays, casual: CalendarDays,
  'on-leave': CalendarDays, leave: CalendarDays, holiday: CalendarDays, unpaid: CalendarDays,
  admin: ShieldCheck, manager: ShieldCheck, employee: User,
};

export default function Pill({ status }) {
  const key = String(status || 'idle').toLowerCase();
  const Icon = ICONS[key] || CircleDot;
  return (
    <span className={`pill pill-${key}`}>
      <Icon aria-hidden="true" />
      {status}
    </span>
  );
}
