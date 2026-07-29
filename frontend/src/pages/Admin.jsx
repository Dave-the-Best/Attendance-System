import { useMemo, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import {
  Users, UserCheck, Hourglass, CheckCircle2, ShieldAlert, PieChart as PieIcon, BarChart3,
  Search, Download, Check, X, CalendarDays, ClipboardList, Building2,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import { fmtTime, fmtDate, initials, downloadCSV } from '../lib/format';
import { useLang } from '../context/LanguageContext';
import PageTransition from '../components/ui/PageTransition';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Pill from '../components/ui/Pill';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';

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

const TABS = [
  { key: 'leaves', label: 'Leave Requests', icon: ClipboardList },
  { key: 'attendance', label: 'Attendance', icon: CalendarDays },
  { key: 'employees', label: 'Employees', icon: Users },
];

const COLORS = { approved: '#059669', pending: '#d97706', rejected: '#e11d48', present: '#059669', late: '#d97706' };

function ChartTip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  return (
    <div style={{ background: 'var(--elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px', boxShadow: 'var(--shadow)', fontSize: 13 }}>
      <span style={{ textTransform: 'capitalize' }}>{p.name || p.payload.name}</span>: <b>{p.value}</b>
    </div>
  );
}

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
      toast.success(`Leave ${review.status}`);
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
  const fLeaves = (allLeaves || []).filter((l) =>
    !q || l.user.name.toLowerCase().includes(q) || l.status.includes(q) || l.type.includes(q));
  const fAtt = (allAttendance || []).filter((a) =>
    !q || a.user.name.toLowerCase().includes(q) || (a.user.department || '').toLowerCase().includes(q));
  const fEmp = (allEmployees || []).filter((u) =>
    !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.department || '').toLowerCase().includes(q));

  const exportEmployees = () =>
    downloadCSV('employees.csv', (allEmployees || []).map((u) => ({
      name: u.name, email: u.email, role: u.role, department: u.department, position: u.position,
    })));
  const exportAttendance = () =>
    downloadCSV('attendance.csv', (allAttendance || []).map((a) => ({
      employee: a.user.name, department: a.user.department, date: a.date,
      checkIn: fmtTime(a.checkIn), checkOut: fmtTime(a.checkOut), hours: a.hoursWorked || 0, status: a.status,
    })));

  if (loading && !data) return <Loader />;

  if (error || !data) {
    const denied = error?.message === 'Admin access required';
    return (
      <PageTransition>
        <Card title="Admin Console" icon={ShieldAlert}>
          <EmptyState
            icon={ShieldAlert}
            title={denied ? 'Admin access required' : 'Could not load admin data'}
            hint={denied
              ? "You're signed in as an employee. Ask an admin to set your role to \"admin\"."
              : (error?.message || 'No data was returned.')}
          />
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
        <StatCard index={0} icon={Users} tone="brand" label="Total Employees" value={stats.totalEmployees} foot="Active team members" />
        <StatCard index={1} icon={UserCheck} tone="ok" label="Present Today" value={stats.presentToday} foot="Checked in today" />
        <StatCard index={2} icon={Hourglass} tone="warn" label="Pending Leaves" value={stats.pendingLeaves} foot="Awaiting your review" />
        <StatCard index={3} icon={CheckCircle2} tone="info" label="Approved Leaves" value={stats.approvedLeaves} foot="This period" />
      </div>

      <div className="grid-2">
        <Card index={0} title="Leave Requests by Status" icon={PieIcon}>
          {leaveChart.length === 0 ? (
            <EmptyState icon={PieIcon} title="No leave data yet" />
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
                    <span style={{ textTransform: 'capitalize' }}>{e.name}</span> · {e.value}
                  </span>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card index={1} title="Attendance Overview" icon={BarChart3}>
          {attChart.every((d) => d.value === 0) ? (
            <EmptyState icon={BarChart3} title="No attendance data yet" />
          ) : (
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attChart} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--muted)', textTransform: 'capitalize' }} axisLine={false} tickLine={false} />
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

      <div style={{ marginTop: 22 }}>
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              {tab === t.key && <motion.span layoutId="admin-tab" className="tab-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><t.icon size={15} /> {t.label}</span>
            </button>
          ))}
        </div>

        <Card>
          <div className="toolbar">
            <div className="field">
              <Search size={17} className="field-ico" />
              <input placeholder={`Search ${tab}…`} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {tab === 'employees' && (
              <button className="btn btn-ghost" onClick={exportEmployees}><Download size={16} /> {t('btn.export')}</button>
            )}
            {tab === 'attendance' && (
              <button className="btn btn-ghost" onClick={exportAttendance}><Download size={16} /> {t('btn.export')}</button>
            )}
          </div>

          {tab === 'leaves' && (
            fLeaves.length === 0 ? <EmptyState icon={ClipboardList} title="No leave requests" /> :
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Reason</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {fLeaves.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <div className="cell-user">
                          <div className="avatar">{initials(l.user.name)}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{l.user.name}</div>
                            <div className="muted small">{l.user.department || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{l.type}</td>
                      <td className="small mono">{fmtDate(l.startDate)}<br />→ {fmtDate(l.endDate)}</td>
                      <td className="small" style={{ maxWidth: 240 }}>{l.reason}</td>
                      <td><Pill status={l.status} /></td>
                      <td>
                        {l.status === 'pending' && (
                          <div className="row-actions">
                            <button className="btn btn-success btn-sm" onClick={() => setReview({ open: true, leave: l, status: 'approved', note: '' })}>
                              <Check size={15} /> {t('btn.approve')}
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => setReview({ open: true, leave: l, status: 'rejected', note: '' })}>
                              <X size={15} /> {t('btn.reject')}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'attendance' && (
            fAtt.length === 0 ? <EmptyState icon={CalendarDays} title="No attendance records" /> :
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Employee</th><th>Date</th><th>Check-in</th><th>Check-out</th><th>Hours</th><th>Status</th></tr></thead>
                <tbody>
                  {fAtt.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div className="cell-user">
                          <div className="avatar">{initials(a.user.name)}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{a.user.name}</div>
                            <div className="muted small">{a.user.department || '—'}</div>
                          </div>
                        </div>
                      </td>
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

          {tab === 'employees' && (
            fEmp.length === 0 ? <EmptyState icon={Users} title="No employees" /> :
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Position</th><th>Joined</th></tr></thead>
                <tbody>
                  {fEmp.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="cell-user">
                          <div className="avatar">{initials(u.name)}</div>
                          <span style={{ fontWeight: 600 }}>{u.name}</span>
                        </div>
                      </td>
                      <td className="small">{u.email}</td>
                      <td><Pill status={u.role} /></td>
                      <td>{u.department || '—'}</td>
                      <td>{u.position || '—'}</td>
                      <td className="mono small">{fmtDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={review.open}
        onClose={() => setReview({ ...review, open: false })}
        title={review.status === 'approved' ? 'Approve leave request' : 'Reject leave request'}
        subtitle={review.leave ? `${review.leave.user.name} · ${review.leave.type} leave` : ''}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setReview({ ...review, open: false })}>Cancel</button>
            <button className={`btn ${review.status === 'approved' ? 'btn-success' : 'btn-danger'}`} disabled={reviewing} onClick={submitReview}>
              {reviewing ? 'Saving…' : review.status === 'approved' ? 'Confirm Approve' : 'Confirm Reject'}
            </button>
          </>
        }
      >
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>Note (optional)</label>
        <textarea
          rows={3}
          style={{ marginTop: 6 }}
          placeholder="Add a note for the employee…"
          value={review.note}
          onChange={(e) => setReview({ ...review, note: e.target.value })}
        />
      </Modal>
    </PageTransition>
  );
}
