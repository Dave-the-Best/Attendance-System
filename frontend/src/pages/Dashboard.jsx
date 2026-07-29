import { useEffect, useMemo, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import {
  Activity, Timer, CalendarRange, CheckCircle2, Hourglass, LogIn, LogOut, BarChart3, History, Target, XCircle,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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

const pad = (n) => String(n).padStart(2, '0');
const GOAL = 8;

export default function Dashboard() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const [now, setNow] = useState(new Date());
  const { data, loading, refetch } = useQuery(DASH, { pollInterval: 30000 });
  const [ci, { loading: ciL }] = useMutation(CHECK_IN);
  const [co, { loading: coL }] = useMutation(CHECK_OUT);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hr = now.getHours();
  const greet = t(hr < 12 ? 'greet.morning' : hr < 18 ? 'greet.afternoon' : 'greet.evening');

  const today = data?.todayAttendance;
  const leaves = data?.myLeaves || [];
  const attendance = useMemo(() => data?.myAttendance || [], [data]);
  const checkedIn = !!today?.checkIn;
  const checkedOut = !!today?.checkOut;
  const working = checkedIn && !checkedOut;

  const checkInMs = today?.checkIn ? new Date(Number(today.checkIn) || today.checkIn).getTime() : 0;
  const sessionMs = working && checkInMs ? Math.max(0, now.getTime() - checkInMs) : 0;
  const sessionText = `${Math.floor(sessionMs / 3600000)}h ${pad(Math.floor((sessionMs % 3600000) / 60000))}m`;
  const liveHours = working ? Math.round((sessionMs / 3600000) * 10) / 10 : (today?.hoursWorked || 0);

  const pending = leaves.filter((l) => l.status === 'pending').length;
  const approved = leaves.filter((l) => l.status === 'approved').length;
  const rejected = leaves.filter((l) => l.status === 'rejected').length;
  const weekHours = Math.round(attendance.filter((a) => isThisWeek(a.date)).reduce((s, a) => s + (a.hoursWorked || 0), 0) * 10) / 10;
  const monthList = attendance.filter((a) => isSameMonth(a.date));
  const monthPresent = monthList.length;
  const monthLate = monthList.filter((a) => a.status === 'late').length;
  const onTime = monthPresent ? Math.round(((monthPresent - monthLate) / monthPresent) * 100) : 100;

  const week = useMemo(() => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i);
      return { key: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, day: d.toLocaleDateString(lang, { weekday: 'short' }), hours: 0 };
    });
    attendance.forEach((a) => { const w = days.find((x) => x.key === (a.date || '').slice(0, 10)); if (w) w.hours += a.hoursWorked || 0; });
    return days;
  }, [attendance, lang]);

  const recent = attendance.slice(0, 6);
  const ringPct = Math.min(liveHours / GOAL, 1);
  const R = 56; const C = 2 * Math.PI * R;

  const doCheckIn = async () => { try { await ci(); await refetch(); toast.success(t('toast.checkin')); } catch (e) { toast.error(e.message); } };
  const doCheckOut = async () => { try { await co(); await refetch(); toast.success(t('toast.checkout')); } catch (e) { toast.error(e.message); } };

  const statusLabel = checkedIn ? (checkedOut ? t('dash.status.completed') : t('dash.status.working')) : t('dash.status.notIn');
  const statusTone = working ? 'ic-ok' : checkedOut ? 'ic-info' : 'ic-brand';

  function WeekTip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;
    return <div className="chart-tip"><div className="k">{label}</div><div className="v">{Math.round(payload[0].value * 10) / 10}h {t('common.worked')}</div></div>;
  }

  if (loading && !data) return <Loader />;

  return (
    <PageTransition>
      <div className="page-head">
        <div>
          <h1>{greet}, {user.name.split(' ')[0]} 👋</h1>
          <p className="sub">{now.toLocaleDateString(lang, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Hero: status + primary action, and today's hours ring */}
      <div className="dash-hero">
        <Card index={0} className="hero-checkin">
          <div className="hero-top">
            <div className="hero-status">
              <div className={`hs-ico ${statusTone}`}><Activity size={24} /></div>
              <div>
                <div className="hs-title">{statusLabel}</div>
                <div className="hs-sub">
                  {working ? `${t('dash.onTheClock')} · ${sessionText}`
                    : checkedIn ? `${t('clock.checkin')} ${fmtTime(today.checkIn)} · ${t('clock.checkout')} ${fmtTime(today.checkOut)}`
                    : t('dash.quick.notCheckedIn')}
                </div>
              </div>
            </div>
            <div className="hero-clock">
              <div className="hc-time">{now.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="hc-date">{now.toLocaleDateString(lang, { weekday: 'short', day: 'numeric', month: 'short' })}</div>
            </div>
          </div>
          <div className="hero-actions">
            <motion.button className="btn btn-success btn-lg" whileTap={{ scale: 0.98 }} disabled={ciL || checkedIn} onClick={doCheckIn}>
              <LogIn size={18} /> {checkedIn ? t('btn.checkedIn') : ciL ? '…' : t('btn.checkin')}
            </motion.button>
            <motion.button className="btn btn-outline btn-lg" whileTap={{ scale: 0.98 }} disabled={coL || !checkedIn || checkedOut} onClick={doCheckOut}>
              <LogOut size={18} /> {checkedOut ? t('btn.checkedOut') : coL ? '…' : t('btn.checkout')}
            </motion.button>
          </div>
        </Card>

        <Card index={1} className="today-ring-card" title={t('dash.today')} icon={Target}>
          <div className="ring-wrap">
            <svg className="ring" viewBox="0 0 132 132" role="img" aria-label={`${liveHours}h ${t('dash.dailyGoal')}`}>
              <circle className="ring-track" cx="66" cy="66" r={R} />
              <circle className="ring-val" cx="66" cy="66" r={R} strokeDasharray={C} strokeDashoffset={C * (1 - ringPct)} transform="rotate(-90 66 66)" />
            </svg>
            <div className="ring-center">
              <div className="ring-num">{liveHours}h</div>
              <div className="ring-sub">{t('dash.dailyGoal')}</div>
            </div>
          </div>
          <div className="today-times">
            <div><div className="k">{t('clock.checkin')}</div><div className="v">{fmtTime(today?.checkIn)}</div></div>
            <div><div className="k">{t('clock.checkout')}</div><div className="v">{fmtTime(today?.checkOut)}</div></div>
          </div>
        </Card>
      </div>

      {/* KPI row */}
      <div className="stat-grid">
        <StatCard index={0} icon={CalendarRange} tone="brand" label={t('dash.stat.thisWeek')} value={weekHours} foot={t('dash.foot.totalHours')} />
        <StatCard index={1} icon={CheckCircle2} tone="ok" label={t('dash.stat.daysPresent')} value={monthPresent} foot={t('dash.foot.thisMonth')} />
        <StatCard index={2} icon={Timer} tone="info" label={t('dash.onTimeRate')} value={`${onTime}%`} animate={false} foot={t('dash.foot.thisMonth')} />
        <StatCard index={3} icon={Hourglass} tone={pending ? 'warn' : 'ok'} label={t('dash.stat.pendingLeaves')} value={pending} foot={t('dash.foot.awaiting')} />
      </div>

      {/* Weekly hours + leave summary */}
      <div className="grid-dash">
        <Card index={0} title={t('dash.weekly')} icon={BarChart3}>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={week} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<WeekTip />} cursor={{ fill: 'var(--surface-2)' }} />
                <Bar dataKey="hours" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card index={1} title={t('dash.leaveSummary')} icon={CalendarRange}>
          <div className="lsum">
            <div className="lsum-row">
              <span className="lsum-ico ic-warn"><Hourglass size={16} /></span>
              <span className="lsum-label">{t('status.pending')}</span>
              <span className="lsum-val">{pending}</span>
            </div>
            <div className="lsum-row">
              <span className="lsum-ico ic-ok"><CheckCircle2 size={16} /></span>
              <span className="lsum-label">{t('status.approved')}</span>
              <span className="lsum-val">{approved}</span>
            </div>
            <div className="lsum-row">
              <span className="lsum-ico ic-danger"><XCircle size={16} /></span>
              <span className="lsum-label">{t('status.rejected')}</span>
              <span className="lsum-val">{rejected}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent attendance */}
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
