import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import toast from 'react-hot-toast';

const MY_LEAVES = gql`
  query {
    myLeaves {
      id type startDate endDate reason status reviewNote createdAt
      reviewedBy { name }
    }
  }
`;
const REQUEST = gql`
  mutation ($type: String!, $startDate: String!, $endDate: String!, $reason: String!) {
    requestLeave(type: $type, startDate: $startDate, endDate: $endDate, reason: $reason) { id }
  }
`;

const fmtDate = (d) => new Date(Number(d) || d).toLocaleDateString();

export default function Leave() {
  const [form, setForm] = useState({ type: 'annual', startDate: '', endDate: '', reason: '' });
  const { data, refetch, loading } = useQuery(MY_LEAVES);
  const [req, { loading: sending }] = useMutation(REQUEST);

  const submit = async (e) => {
    e.preventDefault();
    if (new Date(form.endDate) < new Date(form.startDate))
      return toast.error('End date must be after start date');
    try {
      await req({ variables: form });
      toast.success('Leave request submitted');
      setForm({ type: 'annual', startDate: '', endDate: '', reason: '' });
      refetch();
    } catch (e) { toast.error(e.message); }
  };

  const leaves = data?.myLeaves || [];

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Leave Management</h1><p className="muted">Request and track your leave</p></div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>New Leave Request</h3>
          <form onSubmit={submit} className="form">
            <label>Leave Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="annual">Annual</option>
              <option value="sick">Sick</option>
              <option value="casual">Casual</option>
              <option value="unpaid">Unpaid</option>
            </select>

            <div className="row">
              <div>
                <label>Start Date</label>
                <input type="date" required value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label>End Date</label>
                <input type="date" required value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>

            <label>Reason</label>
            <textarea rows={4} required value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })} />

            <button className="btn btn-primary full" disabled={sending}>
              {sending ? 'Submitting…' : 'Submit Request'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3>Your Requests</h3>
          {loading ? <div className="loader">Loading…</div> :
            leaves.length === 0 ? <div className="empty">No requests yet.</div> :
            <div className="leave-list">
              {leaves.map((l) => (
                <div key={l.id} className="leave-item">
                  <div className="leave-row">
                    <b style={{ textTransform: 'capitalize' }}>{l.type} leave</b>
                    <span className={`pill pill-${l.status}`}>{l.status}</span>
                  </div>
                  <div className="muted small">
                    {fmtDate(l.startDate)} → {fmtDate(l.endDate)}
                  </div>
                  <div className="leave-reason">{l.reason}</div>
                  {l.reviewNote && (
                    <div className="review-note">
                      Note from {l.reviewedBy?.name || 'admin'}: {l.reviewNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
}
