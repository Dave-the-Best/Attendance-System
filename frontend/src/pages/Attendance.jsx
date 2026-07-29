import { useEffect, useMemo, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import { LogIn, LogOut, CalendarCheck, Clock, Timer, AlertTriangle, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { fmtTime, isSameMonth } from '../lib/format';
import { useLang } from '../context/LanguageContext';
import PageTransition from '../components/ui/PageTransition';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Pill from '../components/ui/Pill';
import Loader from '../components/ui/Loader';
import DataTable from '../components/ui/DataTable';

const DATA = gql`
  query {
    todayAttendance { id checkIn checkOut hoursWorked status }
    myAttendance { id date checkIn checkOut hoursWorked status }
  }
`;
const CHECK_IN = gql`mutation { checkIn { id checkIn status } }`;
const CHECK_OUT = gql`mutation { checkOut { id checkOut hoursWorked } }`;

export default function Attendance() {
  const { t, lang } = useLang();
  const { data, refetch, loading } = useQuery(DATA);
  const [ci, { loading: ciL }] = useMutation(CHECK_IN);
  const [co, { loading: coL }] = useMutation(CHECK_OUT);
  const [now, setNow] = useState(new Date());
  const [month, setMonth] = useState('all');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = data?.todayAttendance;
  const list = data?.myAttendance || [];
  const checkedIn = !!today?.checkIn;
  const checkedOut = !!today?.checkOut;

  const monthly = useMemo(() => {
    const m = list.filter((a) => isSameMonth(a.date));
    const hours = m.reduce((s, a) => s + (a.hoursWorked || 0), 0);
    return {
      present: m.length,
      late: m.filter((a) => a.status === 'late').length,
      hours: Math.round(hours * 10) / 10,
      avg: m.length ? Math.round((hours / m.length) * 10) / 10 : 0,
    };
  }, [list]);

  const months = useMemo(() => {
    const set = new Set(list.map((a) => (a.date || '').slice(0, 7)).filter(Boolean));
    return [...set].sort().reverse();
  }, [list]);

  const filtered = month === 'all' ? list : list.filter((a) => (a.date || '').startsWith(month));

  const doCheckIn = async () => {
    try { await ci(); await refetch(); toast.success(t('toast.checkin')); }
    catch (e) { toast.error(e.message); }
  };
  const doCheckOut = async () => {
    try { await co(); await refetch(); toast.success(t('toast.checkout')); }
    catch (e) { toast.error(e.message); }
  };

  const cols = [
    { key: 'date', header: t('tbl.date'), sortable: true, render: (r) => <span className="mono">{r.date}</span> },
    { key: 'checkIn', header: t('tbl.checkin'), render: (r) => <span className="mono">{fmtTime(r.checkIn)}</span> },
    { key: 'checkOut', header: t('tbl.checkout'), render: (r) => <span className="mono">{fmtTime(r.checkOut)}</span> },
    { key: 'hoursWorked', header: t('tbl.hours'), sortable: true, sortValue: (r) => r.hoursWorked || 0, render: (r) => <span className="mono">{r.hoursWorked || 0}h</span> },
    { key: 'status', header: t('tbl.status'), sortable: true, render: (r) => <Pill status={r.status} /> },
  ];

  const monthFilter = (
    <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-auto" aria-label={t('common.duration')}>
      <option value="all">{t('common.allTime')}</option>
      {months.map((m) => (
        <option key={m} value={m}>{new Date(`${m}-01`).toLocaleDateString(lang, { month: 'long', year: 'numeric' })}</option>
      ))}
    </select>
  );

  if (loading && !data) return <Loader />;

  return (
    <PageTransition>
      <div className="page-head">
        <div>
          <h1>{t('page.attendance.title')}</h1>
          <p className="sub">{t('page.attendance.sub')}</p>
        </div>
      </div>

      <Card index={0} className="clock-card">
        <div>
          <div className="clock-time">{now.toLocaleTimeString(lang)}</div>
          <div className="clock-date">{now.toLocaleDateString(lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div className="clock-stats">
            <div className="clock-stat"><div className="k">{t('clock.checkin')}</div><div className="v">{fmtTime(today?.checkIn)}</div></div>
            <div className="clock-stat"><div className="k">{t('clock.checkout')}</div><div className="v">{fmtTime(today?.checkOut)}</div></div>
            <div className="clock-stat"><div className="k">{t('clock.hours')}</div><div className="v">{today?.hoursWorked || 0}h</div></div>
          </div>
        </div>
        <div className="clock-btns">
          <motion.button className="btn btn-success btn-lg" whileTap={{ scale: 0.98 }} disabled={ciL || checkedIn} onClick={doCheckIn}>
            <LogIn size={18} /> {checkedIn ? t('btn.checkedIn') : ciL ? '…' : t('btn.checkin')}
          </motion.button>
          <motion.button className="btn btn-danger btn-lg" whileTap={{ scale: 0.98 }} disabled={coL || !checkedIn || checkedOut} onClick={doCheckOut}>
            <LogOut size={18} /> {checkedOut ? t('btn.checkedOut') : coL ? '…' : t('btn.checkout')}
          </motion.button>
        </div>
      </Card>

      <div className="stat-grid mt-section">
        <StatCard index={0} icon={CalendarCheck} tone="ok" label={t('att.stat.daysPresent')} value={monthly.present} foot={t('dash.foot.thisMonth')} />
        <StatCard index={1} icon={Timer} tone="brand" label={t('att.stat.totalHours')} value={monthly.hours} foot={t('dash.foot.thisMonth')} />
        <StatCard index={2} icon={Clock} tone="info" label={t('att.stat.avgHours')} value={monthly.avg} foot={t('dash.foot.thisMonth')} />
        <StatCard index={3} icon={AlertTriangle} tone={monthly.late ? 'warn' : 'ok'} label={t('att.stat.lateArrivals')} value={monthly.late} foot={t('dash.foot.thisMonth')} />
      </div>

      <Card index={1} title={t('att.card.history')} icon={History}>
        <DataTable
          columns={cols} rows={filtered} rowKey={(r) => r.id}
          filters={monthFilter}
          emptyIcon={History} emptyTitle={t('att.empty')}
          initialSort={{ key: 'date', dir: 'desc' }}
        />
      </Card>
    </PageTransition>
  );
}
