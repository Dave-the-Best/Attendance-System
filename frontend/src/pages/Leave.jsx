import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarPlus, ListChecks, CalendarDays, Send, Hourglass, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { fmtDate, daysBetween } from '../lib/format';
import { useLang } from '../context/LanguageContext';
import PageTransition from '../components/ui/PageTransition';
import Card from '../components/ui/Card';
import Pill from '../components/ui/Pill';
import EmptyState from '../components/ui/EmptyState';

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

const TYPES = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'casual', label: 'Casual Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
];

export default function Leave() {
  const { t } = useLang();
  const [form, setForm] = useState({ type: 'annual', startDate: '', endDate: '', reason: '' });
  const { data, refetch, loading } = useQuery(MY_LEAVES);
  const [req, { loading: sending }] = useMutation(REQUEST);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const duration = form.startDate && form.endDate ? daysBetween(form.startDate, form.endDate) : 0;

  const submit = async (e) => {
    e.preventDefault();
    if (new Date(form.endDate) < new Date(form.startDate)) return toast.error('End date must be after start date');
    try {
      await req({ variables: form });
      toast.success('Leave request submitted');
      setForm({ type: 'annual', startDate: '', endDate: '', reason: '' });
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const leaves = data?.myLeaves || [];
  const counts = {
    pending: leaves.filter((l) => l.status === 'pending').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
  };

  return (
    <PageTransition>
      <div className="page-head">
        <div>
          <h1>{t('page.leave.title')}</h1>
          <p className="sub">{t('page.leave.sub')}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span className="pill pill-pending"><Hourglass size={12} /> {counts.pending} Pending</span>
          <span className="pill pill-approved"><CheckCircle2 size={12} /> {counts.approved} Approved</span>
          <span className="pill pill-rejected"><XCircle size={12} /> {counts.rejected} Rejected</span>
        </div>
      </div>

      <div className="grid-2">
        <Card index={0} title="New Leave Request" icon={CalendarPlus}>
          <form onSubmit={submit} className="form">
            <label>Leave Type</label>
            <select value={form.type} onChange={set('type')}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            <div className="row">
              <div>
                <label>Start Date</label>
                <input type="date" required value={form.startDate} onChange={set('startDate')} />
              </div>
              <div>
                <label>End Date</label>
                <input type="date" required value={form.endDate} min={form.startDate || undefined} onChange={set('endDate')} />
              </div>
            </div>

            <AnimatePresence>
              {duration > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="review-note"
                  style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <CalendarDays size={15} /> Duration: <b>{duration}</b> {duration === 1 ? 'day' : 'days'}
                </motion.div>
              )}
            </AnimatePresence>

            <label>Reason</label>
            <textarea rows={4} required placeholder="Briefly describe the reason for your leave…" value={form.reason} onChange={set('reason')} />

            <button className="btn btn-primary full btn-lg mt-4" disabled={sending}>
              <Send size={17} /> {sending ? '…' : t('btn.submitRequest')}
            </button>
          </form>
        </Card>

        <Card index={1} title="Your Requests" icon={ListChecks}>
          {loading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : leaves.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No requests yet" hint="Submit your first leave request on the left." />
          ) : (
            <div className="leave-list">
              {leaves.map((l, i) => (
                <motion.div
                  key={l.id}
                  className="leave-item"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="leave-row">
                    <b style={{ textTransform: 'capitalize' }}>{l.type} leave</b>
                    <Pill status={l.status} />
                  </div>
                  <div className="muted small">
                    {fmtDate(l.startDate)} → {fmtDate(l.endDate)} · {daysBetween(l.startDate, l.endDate)} {daysBetween(l.startDate, l.endDate) === 1 ? 'day' : 'days'}
                  </div>
                  <div className="leave-reason">{l.reason}</div>
                  {l.reviewNote && (
                    <div className="review-note">
                      <b>Note from {l.reviewedBy?.name || 'admin'}:</b> {l.reviewNote}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageTransition>
  );
}
