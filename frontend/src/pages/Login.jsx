import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { Clock4, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
  'Smart leave management',
  'Live team notifications',
  'Powerful admin analytics',
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
      toast.success(`Welcome back, ${data.login.user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <motion.div className="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="auth-brand-panel">
        <div className="auth-blob b1" />
        <div className="auth-blob b2" />
        <div className="auth-logo">
          <span className="brand-logo"><Clock4 size={22} /></span> AttendPro
        </div>
        <motion.div
          className="auth-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h2>Attendance,<br />reimagined for teams.</h2>
          <p>A modern platform to track time, manage leave, and keep your whole organization in sync — beautifully.</p>
        </motion.div>
        <div className="auth-features">
          {FEATURES.map((f, i) => (
            <motion.div
              className="auth-feature"
              key={f}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.08 }}
            >
              <span className="chk"><CheckCircle2 size={16} /></span> {f}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="auth-form-panel">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="auth-mobile-logo">
            <span className="brand-logo"><Clock4 size={20} /></span> AttendPro
          </div>
          <div className="head">
            <h1>Welcome back</h1>
            <p>Sign in to continue to your workspace</p>
          </div>
          <form onSubmit={submit} className="form">
            <label>Email address</label>
            <div className="field">
              <Mail size={18} className="field-ico" />
              <input
                type="email" required placeholder="you@company.com" autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <label>Password</label>
            <div className="field">
              <Lock size={18} className="field-ico" />
              <input
                type={showPw ? 'text' : 'password'} required placeholder="••••••••" autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => !s)} aria-label="Toggle password">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button className="btn btn-primary full btn-lg" disabled={loading} style={{ marginTop: 22 }}>
              {loading ? 'Signing in…' : <>Sign in <ArrowRight size={18} /></>}
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
