import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarPlus, ListChecks, CalendarDays, Send, Hourglass, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { fmtDate, daysBetween } from '../lib/format';
import { useLang } from '../context/LanguageContext';
import { useAppMotion } from '../lib/motion';
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

const TYPES = ['annual', 'sick', 'casual', 'unpaid'];

export default function Leave() {
  const { t } = useLang();
  const m = useAppMotion();
  const [form, setForm] = useState({ type: 'annual', startDate: '', endDate: '', reason: '' });
  const { data, refetch, loading } = useQuery(MY_LEAVES);
  const [req, { loading: sending }] = useMutation(REQUEST);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const duration = form.startDate && form.endDate ? daysBetween(form.startDate, form.endDate) : 0;
  const dayLabel = (n) => `${n} ${n === 1 ? t('common.day') : t('common.days')}`;

  const submit = async (e) => {
    e.preventDefault();
    if (new Date(form.endDate) < new Date(form.startDate)) return toast.error(t('toast.leaveEndBeforeStart'));
    try {
      await req({ variables: form });
      toast.success(t('toast.leaveSubmitted'));
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
        <div className="leave-counts">
          <span className="pill pill-pending"><Hourglass size={12} /> {counts.pending} {t('status.pending')}</span>
          <span className="pill pill-approved"><CheckCircle2 size={12} /> {counts.approved} {t('status.approved')}</span>
          <span className="pill pill-rejected"><XCircle size={12} /> {counts.rejected} {t('status.rejected')}</span>
        </div>
      </div>

      <div className="grid-2">
        <Card index={0} title={t('leave.card.new')} icon={CalendarPlus}>
          <form onSubmit={submit} className="form">
            <label htmlFor="ltype">{t('leave.form.type')}</label>
            <select id="ltype" value={form.type} onChange={set('type')}>
              {TYPES.map((ty) => <option key={ty} value={ty}>{t(`leave.type.${ty}`)}</option>)}
            </select>

            <div className="row">
              <div>
                <label htmlFor="lstart">{t('leave.form.start')}</label>
                <input id="lstart" type="date" required value={form.startDate} onChange={set('startDate')} />
              </div>
              <div>
                <label htmlFor="lend">{t('leave.form.end')}</label>
                <input id="lend" type="date" required value={form.endDate} min={form.startDate || undefined} onChange={set('endDate')} />
              </div>
            </div>

            <AnimatePresence>
              {duration > 0 && (
                <motion.div className="leave-duration" {...m.fade()}>
                  <CalendarDays size={15} /> {t('common.duration')}: <b>{dayLabel(duration)}</b>
                </motion.div>
              )}
            </AnimatePresence>

            <label htmlFor="lreason">{t('leave.form.reason')}</label>
            <textarea id="lreason" rows={4} required placeholder={t('leave.reasonPlaceholder')} value={form.reason} onChange={set('reason')} />

            <button className="btn btn-primary full btn-lg mt-4" disabled={sending}>
              <Send size={17} /> {sending ? '…' : t('btn.submitRequest')}
            </button>
          </form>
        </Card>

        <Card index={1} title={t('leave.card.your')} icon={ListChecks}>
          {loading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : leaves.length === 0 ? (
            <EmptyState icon={CalendarDays} title={t('leave.empty')} hint={t('leave.emptyHint')} />
          ) : (
            <div className="leave-list">
              {leaves.map((l, i) => (
                <motion.div key={l.id} className="leave-item" {...m.rise(i)}>
                  <div className="leave-row">
                    <b>{t(`leave.type.${l.type}`)}</b>
                    <Pill status={l.status} />
                  </div>
                  <div className="muted small">
                    {fmtDate(l.startDate)} → {fmtDate(l.endDate)} · {dayLabel(daysBetween(l.startDate, l.endDate))}
                  </div>
                  <div className="leave-reason">{l.reason}</div>
                  {l.reviewNote && (
                    <div className="review-note">
                      <b>{t('common.noteFrom')} {l.reviewedBy?.name || t('status.admin')}:</b> {l.reviewNote}
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
