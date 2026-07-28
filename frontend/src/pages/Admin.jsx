import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import toast from 'react-hot-toast';

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

const fmt = (d) => (d ? new Date(Number(d) || d).toLocaleTimeString() : '—');
const fmtDate = (d) => (d ? new Date(Number(d) || d).toLocaleDateString() : '—');

export default function Admin() {
  const [tab, setTab] = useState('leaves');
  const { data, refetch, loading, error } = useQuery(ADMIN_DATA);
  const [review] = useMutation(REVIEW);

  const act = async (id, status) => {
    const note = window.prompt(`Add a note for this ${status} decision (optional):`, '') || '';
    try {
      await review({ variables: { id, status, reviewNote: note } });
      toast.success(`Leave ${status}`);
      refetch();
    } catch (e) { toast.error(e.message); }
  };

  if (loading) return <div className="page"><div className="loader">Loading…</div></div>;
  if (error || !data) return (
    <div className="page">
      <div className="page-head"><div><h1>Admin Console</h1></div></div>
      <div className="card"><div className="empty">
        {error?.message === 'Admin access required'
          ? 'You are signed in as an employee. Ask an admin to grant you access (role must be "admin").'
          : `Could not load admin data: ${error?.message || 'no data returned'}`}
      </div></div>
    </div>
  );
  const { stats, allLeaves, allAttendance, allEmployees } = data;

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Admin Console</h1><p className="muted">Manage employees, attendance and leave</p></div>
      </div>

      <div className="stat-grid">
        <div className="stat stat-info"><div className="stat-label">Employees</div><div className="stat-value">{stats.totalEmployees}</div></div>
        <div className="stat stat-ok"><div className="stat-label">Present Today</div><div className="stat-value">{stats.presentToday}</div></div>
        <div className="stat stat-warn"><div className="stat-label">Pending Leaves</div><div className="stat-value">{stats.pendingLeaves}</div></div>
        <div className="stat stat-ok"><div className="stat-label">Approved Leaves</div><div className="stat-value">{stats.approvedLeaves}</div></div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'leaves' ? 'active' : ''}`} onClick={() => setTab('leaves')}>Leave Requests</button>
        <button className={`tab ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>Attendance</button>
        <button className={`tab ${tab === 'employees' ? 'active' : ''}`} onClick={() => setTab('employees')}>Employees</button>
      </div>

      {tab === 'leaves' && (
        <div className="card">
          {allLeaves.length === 0 ? <div className="empty">No leave requests.</div> :
            <table className="table">
              <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Reason</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {allLeaves.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div><b>{l.user.name}</b></div>
                      <div className="muted small">{l.user.department}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{l.type}</td>
                    <td className="small">{fmtDate(l.startDate)}<br/>→ {fmtDate(l.endDate)}</td>
                    <td className="small">{l.reason}</td>
                    <td><span className={`pill pill-${l.status}`}>{l.status}</span></td>
                    <td>
                      {l.status === 'pending' && (
                        <div className="row-actions">
                          <button className="btn btn-sm btn-primary" onClick={() => act(l.id, 'approved')}>Approve</button>
                          <button className="btn btn-sm btn-danger" onClick={() => act(l.id, 'rejected')}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </div>
      )}

      {tab === 'attendance' && (
        <div className="card">
          {allAttendance.length === 0 ? <div className="empty">No records.</div> :
            <table className="table">
              <thead><tr><th>Employee</th><th>Date</th><th>Check-in</th><th>Check-out</th><th>Hours</th><th>Status</th></tr></thead>
              <tbody>
                {allAttendance.map((a) => (
                  <tr key={a.id}>
                    <td><b>{a.user.name}</b><div className="muted small">{a.user.department}</div></td>
                    <td>{a.date}</td>
                    <td>{fmt(a.checkIn)}</td>
                    <td>{fmt(a.checkOut)}</td>
                    <td>{a.hoursWorked || 0}h</td>
                    <td><span className={`pill pill-${a.status}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </div>
      )}

      {tab === 'employees' && (
        <div className="card">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Position</th><th>Joined</th></tr></thead>
            <tbody>
              {allEmployees.map((u) => (
                <tr key={u.id}>
                  <td><b>{u.name}</b></td>
                  <td>{u.email}</td>
                  <td><span className={`pill pill-${u.role === 'admin' ? 'approved' : 'present'}`}>{u.role}</span></td>
                  <td>{u.department}</td>
                  <td>{u.position}</td>
                  <td>{fmtDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
