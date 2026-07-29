import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { Clock4, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { duration, ease } from '../lib/motion';
import toast from 'react-hot-toast';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user { id name email role department position }
    }
  }
`;

const FEATURES = [
  'Real-time attendance tracking',
  'Leave requests and approvals',
  'Live team notifications',
  'Admin analytics and exports',
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loginMut, { loading }] = useMutation(LOGIN);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await loginMut({ variables: form });
      login(data.login.token, data.login.user);
      toast.success(`Welcome back, ${data.login.user.name.split(' ')[0]}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <motion.div className="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="auth-brand-panel">
        <div className="auth-grid-bg" />
        <div className="auth-glow" />
        <div className="auth-logo">
          <span className="brand-logo"><Clock4 size={18} /></span> AttendPro
        </div>
        <motion.div className="auth-hero"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: duration.deliberate, ease: ease.decelerate }}
        >
          <h2>Attendance management,<br />built for teams.</h2>
          <p>Track time, manage leave, and keep your whole organization in sync — from one clean workspace.</p>
        </motion.div>
        <div className="auth-features">
          {FEATURES.map((f, i) => (
            <motion.div className="auth-feature" key={f}
              initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.07, duration: duration.slow, ease: ease.decelerate }}
            >
              <span className="chk"><Check size={14} /></span> {f}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="auth-form-panel">
        <motion.div className="auth-card"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.deliberate, ease: ease.decelerate }}
        >
          <div className="auth-mobile-logo">
            <span className="brand-logo"><Clock4 size={18} /></span> AttendPro
          </div>
          <div className="head">
            <h1>Sign in</h1>
            <p>Welcome back — sign in to your workspace.</p>
          </div>
          <form onSubmit={submit} className="form">
            <label htmlFor="email">Email address</label>
            <div className="field">
              <Mail size={17} className="field-ico" />
              <input id="email" type="email" required placeholder="you@company.com" autoComplete="email"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>

            <label htmlFor="password">Password</label>
            <div className="field">
              <Lock size={17} className="field-ico" />
              <input id="password" type={showPw ? 'text' : 'password'} required placeholder="••••••••" autoComplete="current-password"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <button className="btn btn-primary full btn-lg mt-5" disabled={loading}>
              {loading ? 'Signing in…' : <>Sign in <ArrowRight size={17} /></>}
            </button>
            <div className="form-foot">
              Don't have an account? <Link to="/register">Create one</Link>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
