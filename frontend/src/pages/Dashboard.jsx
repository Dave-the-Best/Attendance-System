import { gql, useMutation, useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import {
  Activity, Timer, CalendarRange, CheckCircle2, Hourglass, LogIn, LogOut, TrendingUp, History,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { fmtTime, isThisWeek, isSameMonth } from '../lib/format';
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

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLang();
  const hr = new Date().getHours();
  const greet = t(hr < 12 ? 'greet.morning' : hr < 18 ? 'greet.afternoon' : 'greet.evening');
  const { data, loading, refetch } = useQuery(DASH, { pollInterval: 30000 });
  const [ci, { loading: ciL }] = useMutation(CHECK_IN);
  const [co, { loading: coL }] = useMutation(CHECK_OUT);

  function ChartTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="chart-tip">
        <div className="k">{label}</div>
        <div className="v">{payload[0].value}h {t('common.worked')}</div>
      </div>
    );
  }

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

  const chartData = [...attendance].slice(0, 10).reverse().map((a) => ({ day: (a.date || '').slice(5), hours: a.hoursWorked || 0 }));
  const recent = attendance.slice(0, 6);

  const doCheckIn = async () => {
    try { await ci(); await refetch(); toast.success(t('toast.checkin')); }
    catch (e) { toast.error(e.message); }
  };
  const doCheckOut = async () => {
    try { await co(); await refetch(); toast.success(t('toast.checkout')); }
    catch (e) { toast.error(e.message); }
  };

  const statusLabel = checkedIn ? (checkedOut ? t('dash.status.completed') : t('dash.status.working')) : t('dash.status.notIn');
  const statusTone = checkedIn ? (checkedOut ? 'ok' : 'warn') : 'idle';

  return (
    <PageTransition>
      <div className="page-head">
        <div>
          <h1>{greet}, {user.name.split(' ')[0]} 👋</h1>
          <p className="sub">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard index={0} icon={Activity} tone={statusTone} label={t('dash.stat.todayStatus')} value={statusLabel} animate={false}
          foot={checkedIn ? <><CheckCircle2 size={13} /> {t('dash.foot.checkedInAt')} {fmtTime(today.checkIn)}</> : t('dash.foot.tapToStart')} />
        <StatCard index={1} icon={Timer} tone="info" label={t('dash.stat.hoursToday')} value={today?.hoursWorked || 0} foot={t('dash.foot.loggedToday')} />
        <StatCard index={2} icon={CalendarRange} tone="brand" label={t('dash.stat.thisWeek')} value={Math.round(weekHours * 10) / 10} foot={t('dash.foot.totalHours')} />
        <StatCard index={3} icon={Hourglass} tone={pending ? 'warn' : 'ok'} label={t('dash.stat.pendingLeaves')} value={pending} foot={t('dash.foot.awaiting')} />
        <StatCard index={4} icon={CheckCircle2} tone="ok" label={t('dash.stat.approvedLeaves')} value={approved} foot={t('dash.foot.thisPeriod')} />
        <StatCard index={5} icon={CalendarRange} tone="info" label={t('dash.stat.daysPresent')} value={monthPresent} foot={t('dash.foot.thisMonth')} />
      </div>

      <div className="grid-dash">
        <Card index={0} title={t('dash.card.trend')} icon={TrendingUp}>
          {chartData.length === 0 ? (
            <EmptyState icon={TrendingUp} title={t('dash.empty.trend')} hint={t('dash.empty.trendHint')} />
          ) : (
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="hours" stroke="#4f46e5" strokeWidth={2.5} fill="url(#hoursGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card index={1} title={t('dash.card.quickCheck')} icon={Timer}>
          <div className="quick-check">
            <div className="quick-status">
              <div className={`qs-ico ${statusTone === 'ok' ? 'ic-ok' : statusTone === 'warn' ? 'ic-warn' : 'ic-brand'}`}>
                <Activity size={20} />
              </div>
              <div>
                <div className="qs-title">{statusLabel}</div>
                <div className="small muted">
                  {checkedIn ? `${t('clock.checkin')} ${fmtTime(today.checkIn)}${checkedOut ? ` · ${t('clock.checkout')} ${fmtTime(today.checkOut)}` : ''}` : t('dash.quick.notCheckedIn')}
                </div>
              </div>
            </div>
            <motion.button className="btn btn-success full btn-lg" whileTap={{ scale: 0.98 }} disabled={ciL || checkedIn} onClick={doCheckIn}>
              <LogIn size={18} /> {checkedIn ? t('btn.checkedIn') : ciL ? '…' : t('btn.checkin')}
            </motion.button>
            <motion.button className="btn btn-outline full btn-lg" whileTap={{ scale: 0.98 }} disabled={coL || !checkedIn || checkedOut} onClick={doCheckOut}>
              <LogOut size={18} /> {checkedOut ? t('btn.checkedOut') : coL ? '…' : t('btn.checkout')}
            </motion.button>
          </div>
        </Card>
      </div>

      <Card index={2} title={t('dash.card.recent')} icon={History}>
        {recent.length === 0 ? (
          <EmptyState icon={History} title={t('dash.empty.recent')} hint={t('dash.empty.recentHint')} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">{t('tbl.date')}</th><th scope="col">{t('tbl.checkin')}</th>
                  <th scope="col">{t('tbl.checkout')}</th><th scope="col">{t('tbl.hours')}</th><th scope="col">{t('tbl.status')}</th>
                </tr>
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
