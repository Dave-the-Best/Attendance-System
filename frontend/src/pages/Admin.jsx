import { useMemo, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import {
  Users, UserCheck, Hourglass, CheckCircle2, ShieldAlert, PieChart as PieIcon, BarChart3,
  Check, X, CalendarDays, ClipboardList,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import { fmtTime, fmtDate, initials, downloadCSV } from '../lib/format';
import { useLang } from '../context/LanguageContext';
import { springSoft } from '../lib/motion';
import PageTransition from '../components/ui/PageTransition';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Pill from '../components/ui/Pill';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import DataTable from '../components/ui/DataTable';

const ADMIN_DATA = gql`
  query {
    stats { totalEmployees presentToday pendingLeaves approvedLeaves }
    allLeaves {
      id type startDate endDate reason status
      user { id name email department position }
    }
    allAttendance {
      id date checkIn checkOut hoursWorked status
      user { id name email department }
    }
    allEmployees { id name email role department position createdAt }
  }
`;
const REVIEW = gql`
  mutation ($id: ID!, $status: String!, $reviewNote: String) {
    reviewLeave(id: $id, status: $status, reviewNote: $reviewNote) { id status }
  }
`;

const COLORS = { approved: '#15803d', pending: '#b45309', rejected: '#b91c1c', present: '#15803d', late: '#b45309' };

function ChartTip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  return (
    <div className="chart-tip">
      <span className="capitalize">{p.name || p.payload.name}</span>: <b>{p.value}</b>
    </div>
  );
}

const UserCell = ({ user }) => (
  <div className="cell-user">
    <div className="avatar">{initials(user.name)}</div>
    <div>
      <div className="cell-title">{user.name}</div>
      <div className="muted small">{user.department || '—'}</div>
    </div>
  </div>
);

export default function Admin() {
  const { t } = useLang();
  const [tab, setTab] = useState('leaves');
  const [search, setSearch] = useState('');
  const [review, setReview] = useState({ open: false, leave: null, status: 'approved', note: '' });
  const { data, refetch, loading, error } = useQuery(ADMIN_DATA);
  const [reviewMut, { loading: reviewing }] = useMutation(REVIEW);

  const submitReview = async () => {
    try {
      await reviewMut({ variables: { id: review.leave.id, status: review.status, reviewNote: review.note } });
      toast.success(review.status === 'approved' ? t('toast.leaveApproved') : t('toast.leaveRejected'));
      setReview({ open: false, leave: null, status: 'approved', note: '' });
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const { stats, allLeaves, allAttendance, allEmployees } = data || {};

  const leaveChart = useMemo(() => {
    if (!allLeaves) return [];
    const c = { pending: 0, approved: 0, rejected: 0 };
    allLeaves.forEach((l) => { c[l.status] = (c[l.status] || 0) + 1; });
    return Object.entries(c).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [allLeaves]);

  const attChart = useMemo(() => {
    if (!allAttendance) return [];
    const c = { present: 0, late: 0 };
    allAttendance.forEach((a) => { c[a.status] = (c[a.status] || 0) + 1; });
    return Object.entries(c).map(([name, value]) => ({ name, value }));
  }, [allAttendance]);

  const q = search.trim().toLowerCase();
  const fLeaves = (allLeaves || []).filter((l) => !q || l.user.name.toLowerCase().includes(q) || l.status.includes(q) || l.type.includes(q));
  const fAtt = (allAttendance || []).filter((a) => !q || a.user.name.toLowerCase().includes(q) || (a.user.department || '').toLowerCase().includes(q));
  const fEmp = (allEmployees || []).filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.department || '').toLowerCase().includes(q));

  const exportEmployees = () => downloadCSV('employees.csv', (allEmployees || []).map((u) => ({
    name: u.name, email: u.email, role: u.role, department: u.department, position: u.position,
  })));
  const exportAttendance = () => downloadCSV('attendance.csv', (allAttendance || []).map((a) => ({
    employee: a.user.name, department: a.user.department, date: a.date,
    checkIn: fmtTime(a.checkIn), checkOut: fmtTime(a.checkOut), hours: a.hoursWorked || 0, status: a.status,
  })));

  const TABS = [
    { key: 'leaves', label: t('admin.tab.leaves'), icon: ClipboardList },
    { key: 'attendance', label: t('admin.tab.attendance'), icon: CalendarDays },
    { key: 'employees', label: t('admin.tab.employees'), icon: Users },
  ];

  const leaveCols = [
    { key: 'name', header: t('tbl.employee'), sortable: true, sticky: true, sortValue: (r) => r.user.name, render: (r) => <UserCell user={r.user} /> },
    { key: 'type', header: t('tbl.type'), sortable: true, render: (r) => <Pill status={r.type} /> },
    { key: 'startDate', header: t('tbl.dates'), sortable: true, render: (r) => <span className="small mono">{fmtDate(r.startDate)} → {fmtDate(r.endDate)}</span> },
    { key: 'reason', header: t('tbl.reason'), render: (r) => <span className="small cell-reason">{r.reason}</span> },
    { key: 'status', header: t('tbl.status'), sortable: true, render: (r) => <Pill status={r.status} /> },
    { key: 'actions', header: '', render: (r) => (r.status === 'pending' ? (
      <div className="row-actions">
        <button className="btn btn-success btn-sm" onClick={() => setReview({ open: true, leave: r, status: 'approved', note: '' })}><Check size={14} /> {t('btn.approve')}</button>
        <button className="btn btn-danger btn-sm" onClick={() => setReview({ open: true, leave: r, status: 'rejected', note: '' })}><X size={14} /> {t('btn.reject')}</button>
      </div>
    ) : null) },
  ];

  const attCols = [
    { key: 'name', header: t('tbl.employee'), sortable: true, sticky: true, sortValue: (r) => r.user.name, render: (r) => <UserCell user={r.user} /> },
    { key: 'date', header: t('tbl.date'), sortable: true, render: (r) => <span className="mono">{r.date}</span> },
    { key: 'checkIn', header: t('tbl.checkin'), render: (r) => <span className="mono">{fmtTime(r.checkIn)}</span> },
    { key: 'checkOut', header: t('tbl.checkout'), render: (r) => <span className="mono">{fmtTime(r.checkOut)}</span> },
    { key: 'hoursWorked', header: t('tbl.hours'), sortable: true, sortValue: (r) => r.hoursWorked || 0, render: (r) => <span className="mono">{r.hoursWorked || 0}h</span> },
    { key: 'status', header: t('tbl.status'), sortable: true, render: (r) => <Pill status={r.status} /> },
  ];

  const empCols = [
    { key: 'name', header: t('tbl.name'), sortable: true, sticky: true, render: (r) => (
      <div className="cell-user"><div className="avatar">{initials(r.name)}</div><span className="cell-title">{r.name}</span></div>
    ) },
    { key: 'email', header: t('tbl.email'), render: (r) => <span className="small">{r.email}</span> },
    { key: 'role', header: t('tbl.role'), sortable: true, render: (r) => <Pill status={r.role} /> },
    { key: 'department', header: t('tbl.department'), sortable: true, render: (r) => r.department || '—' },
    { key: 'position', header: t('tbl.position'), render: (r) => r.position || '—' },
    { key: 'createdAt', header: t('tbl.joined'), sortable: true, sortValue: (r) => Number(r.createdAt) || 0, render: (r) => <span className="mono small">{fmtDate(r.createdAt)}</span> },
  ];

  if (loading && !data) return <Loader />;

  if (error || !data) {
    const denied = error?.message === 'Admin access required';
    return (
      <PageTransition>
        <Card title={t('page.admin.title')} icon={ShieldAlert}>
          <div className={denied ? 'state-locked' : 'state-danger'}>
            <EmptyState
              icon={ShieldAlert}
              title={denied ? t('admin.denied.title') : t('admin.error.title')}
              hint={denied ? t('admin.denied.hint') : (error?.message || t('admin.error.hint'))}
            />
          </div>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="page-head">
        <div>
          <h1>{t('page.admin.title')}</h1>
          <p className="sub">{t('page.admin.sub')}</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard index={0} icon={Users} tone="brand" label={t('admin.stat.totalEmployees')} value={stats.totalEmployees} foot={t('admin.foot.activeMembers')} />
        <StatCard index={1} icon={UserCheck} tone="ok" label={t('admin.stat.presentToday')} value={stats.presentToday} foot={t('admin.foot.checkedInToday')} />
        <StatCard index={2} icon={Hourglass} tone="warn" label={t('admin.stat.pendingLeaves')} value={stats.pendingLeaves} foot={t('admin.foot.awaitingReview')} />
        <StatCard index={3} icon={CheckCircle2} tone="info" label={t('admin.stat.approvedLeaves')} value={stats.approvedLeaves} foot={t('admin.foot.thisPeriod')} />
      </div>

      <div className="grid-2">
        <Card index={0} title={t('admin.card.leaveByStatus')} icon={PieIcon}>
          {leaveChart.length === 0 ? (
            <EmptyState icon={PieIcon} title={t('admin.empty.leaveData')} />
          ) : (
            <>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={leaveChart} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3} stroke="none">
                      {leaveChart.map((e) => <Cell key={e.name} fill={COLORS[e.name] || '#6366f1'} />)}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend">
                {leaveChart.map((e) => (
                  <span className="lg" key={e.name}>
                    <span className="dot" style={{ background: COLORS[e.name] || '#6366f1' }} />
                    {t(`status.${e.name}`)} · {e.value}
                  </span>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card index={1} title={t('admin.card.attendanceOverview')} icon={BarChart3}>
          {attChart.every((d) => d.value === 0) ? (
            <EmptyState icon={BarChart3} title={t('admin.empty.attData')} />
          ) : (
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attChart} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tickFormatter={(v) => t(`status.${v}`)} tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} width={40} allowDecimals={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: 'var(--surface-2)' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={72}>
                    {attChart.map((e) => <Cell key={e.name} fill={COLORS[e.name] || '#6366f1'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-section">
        <div className="tabs" role="tablist">
          {TABS.map((tb) => (
            <button key={tb.key} role="tab" aria-selected={tab === tb.key} className={`tab ${tab === tb.key ? 'active' : ''}`} onClick={() => { setTab(tb.key); setSearch(''); }}>
              {tab === tb.key && <motion.span layoutId="admin-tab" className="tab-pill" transition={springSoft} />}
              <span className="tab-inner"><tb.icon size={15} /> {tb.label}</span>
            </button>
          ))}
        </div>

        <Card>
          {tab === 'leaves' && (
            <DataTable
              columns={leaveCols} rows={fLeaves} rowKey={(r) => r.id}
              search={search} onSearch={setSearch}
              emptyIcon={ClipboardList} emptyTitle={t('admin.empty.leaves')}
              initialSort={{ key: 'status', dir: 'asc' }}
            />
          )}
          {tab === 'attendance' && (
            <DataTable
              columns={attCols} rows={fAtt} rowKey={(r) => r.id}
              search={search} onSearch={setSearch}
              actions={<button className="chip-filter" onClick={exportAttendance}>{t('btn.export')}</button>}
              emptyIcon={CalendarDays} emptyTitle={t('admin.empty.attendance')}
              initialSort={{ key: 'date', dir: 'desc' }}
            />
          )}
          {tab === 'employees' && (
            <DataTable
              columns={empCols} rows={fEmp} rowKey={(r) => r.id}
              search={search} onSearch={setSearch}
              actions={<button className="chip-filter" onClick={exportEmployees}>{t('btn.export')}</button>}
              emptyIcon={Users} emptyTitle={t('admin.empty.employees')}
              initialSort={{ key: 'name', dir: 'asc' }}
            />
          )}
        </Card>
      </div>

      <Modal
        open={review.open}
        onClose={() => setReview({ ...review, open: false })}
        title={review.status === 'approved' ? t('admin.modal.approveTitle') : t('admin.modal.rejectTitle')}
        subtitle={review.leave ? `${review.leave.user.name} · ${t(`leave.type.${review.leave.type}`)}` : ''}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setReview({ ...review, open: false })}>{t('common.cancel')}</button>
            <button className={`btn ${review.status === 'approved' ? 'btn-success' : 'btn-danger'}`} disabled={reviewing} onClick={submitReview}>
              {reviewing ? t('common.saving') : review.status === 'approved' ? t('admin.modal.confirmApprove') : t('admin.modal.confirmReject')}
            </button>
          </>
        }
      >
        <label htmlFor="review-note">{t('admin.modal.note')}</label>
        <textarea id="review-note" rows={3} placeholder={t('admin.modal.notePlaceholder')} value={review.note} onChange={(e) => setReview({ ...review, note: e.target.value })} />
      </Modal>
    </PageTransition>
  );
}
