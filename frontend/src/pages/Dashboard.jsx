import { gql, useMutation, useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import {
  Activity, Timer, CalendarRange, CheckCircle2, Hourglass, LogIn, LogOut, TrendingUp, History,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { fmtTime, greeting, isThisWeek, isSameMonth } from '../lib/format';
import PageTransition from '../components/ui/PageTransition';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Pill from '../components/ui/Pill';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';

const DASH = gql`
  query {
    todayAttendance { id checkIn checkOut hoursWorked status }
    myLeaves { id status }
    myAttendance { id date checkIn checkOut hoursWorked status }
  }
`;
const CHECK_IN = gql`mutation { checkIn { id checkIn status } }`;
const CHECK_OUT = gql`mutation { checkOut { id checkOut hoursWorked } }`;

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: 'var(--elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 12px', boxShadow: 'var(--shadow)', fontSize: 13 }}>
      <div style={{ color: 'var(--muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{payload[0].value}h worked</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, refetch } = useQuery(DASH, { pollInterval: 30000 });
  const [ci, { loading: ciL }] = useMutation(CHECK_IN);
  const [co, { loading: coL }] = useMutation(CHECK_OUT);

  if (loading && !data) return <Loader />;

  const today = data?.todayAttendance;
  const leaves = data?.myLeaves || [];
  const attendance = data?.myAttendance || [];
  const checkedIn = !!today?.checkIn;
  const checkedOut = !!today?.checkOut;

  const pending = leaves.filter((l) => l.status === 'pending').length;
  const approved = leaves.filter((l) => l.status === 'approved').length;
  const weekHours = attendance.filter((a) => isThisWeek(a.date)).reduce((s, a) => s + (a.hoursWorked || 0), 0);
  const monthPresent = attendance.filter((a) => isSameMonth(a.date)).length;

  const chartData = [...attendance]
    .slice(0, 10)
    .reverse()
    .map((a) => ({ day: (a.date || '').slice(5), hours: a.hoursWorked || 0 }));

  const recent = attendance.slice(0, 6);

  const doCheckIn = async () => {
    try { await ci(); await refetch(); toast.success('Checked in — have a great day!'); }
    catch (e) { toast.error(e.message); }
  };
  const doCheckOut = async () => {
    try { await co(); await refetch(); toast.success('Checked out. See you tomorrow!'); }
    catch (e) { toast.error(e.message); }
  };

  const statusLabel = checkedIn ? (checkedOut ? 'Completed' : 'Working') : 'Not in';
  const statusTone = checkedIn ? (checkedOut ? 'ok' : 'warn') : 'idle';

  return (
    <PageTransition>
      <div className="page-head">
        <div>
          <h1>{greeting()}, {user.name.split(' ')[0]} 👋</h1>
          <p className="muted">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard index={0} icon={Activity} tone={statusTone} label="Today's Status" value={statusLabel} animate={false}
          foot={checkedIn ? <><CheckCircle2 size={13} /> Checked in at {fmtTime(today.checkIn)}</> : 'Tap check-in to start'} />
        <StatCard index={1} icon={Timer} tone="info" label="Hours Today" value={today?.hoursWorked || 0} foot="Logged so far today" />
        <StatCard index={2} icon={CalendarRange} tone="brand" label="This Week" value={Math.round(weekHours * 10) / 10} foot="Total hours worked" />
        <StatCard index={3} icon={Hourglass} tone={pending ? 'warn' : 'ok'} label="Pending Leaves" value={pending} foot="Awaiting review" />
        <StatCard index={4} icon={CheckCircle2} tone="ok" label="Approved Leaves" value={approved} foot="This period" />
        <StatCard index={5} icon={CalendarRange} tone="info" label="Days Present" value={monthPresent} foot="This month" />
      </div>

      <div className="grid-dash">
        <Card index={0} title="Attendance Trend" icon={TrendingUp}>
          {chartData.length === 0 ? (
            <EmptyState icon={TrendingUp} title="No attendance data yet" hint="Your logged hours will appear here." />
          ) : (
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2.5} fill="url(#hoursGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card index={1} title="Quick Check-In" icon={Timer}>
          <div className="quick-check">
            <div className="quick-status">
              <div className={`qs-ico ${statusTone === 'ok' ? 'ic-ok' : statusTone === 'warn' ? 'ic-warn' : 'ic-brand'}`}>
                <Activity size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{statusLabel}</div>
                <div className="small muted">
                  {checkedIn ? `In ${fmtTime(today.checkIn)}${checkedOut ? ` · Out ${fmtTime(today.checkOut)}` : ''}` : 'You have not checked in today'}
                </div>
              </div>
            </div>
            <motion.button className="btn btn-success full btn-lg" whileTap={{ scale: 0.98 }}
              disabled={ciL || checkedIn} onClick={doCheckIn}>
              <LogIn size={18} /> {checkedIn ? 'Checked In' : ciL ? 'Please wait…' : 'Check In'}
            </motion.button>
            <motion.button className="btn btn-outline full btn-lg" whileTap={{ scale: 0.98 }}
              disabled={coL || !checkedIn || checkedOut} onClick={doCheckOut}>
              <LogOut size={18} /> {checkedOut ? 'Checked Out' : coL ? 'Please wait…' : 'Check Out'}
            </motion.button>
          </div>
        </Card>
      </div>

      <Card index={2} title="Recent Attendance" icon={History} className="" >
        {recent.length === 0 ? (
          <EmptyState icon={History} title="No records yet" hint="Check in to create your first record." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Date</th><th>Check-in</th><th>Check-out</th><th>Hours</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recent.map((a) => (
                  <tr key={a.id}>
                    <td className="mono">{a.date}</td>
                    <td className="mono">{fmtTime(a.checkIn)}</td>
                    <td className="mono">{fmtTime(a.checkOut)}</td>
                    <td className="mono">{a.hoursWorked || 0}h</td>
                    <td><Pill status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageTransition>
  );
}
