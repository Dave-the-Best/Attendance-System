import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { Clock4, User, Mail, Lock, Building2, Briefcase, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const REGISTER = gql`
  mutation Register($name: String!, $email: String!, $password: String!, $department: String, $position: String) {
    register(name: $name, email: $email, password: $password, department: $department, position: $position) {
      token
      user { id name email role department position }
    }
  }
`;

const FEATURES = [
  'Free for your whole team',
  'Set up in under a minute',
  'Works on every device',
  'Secure by design',
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', position: '' });
  const [showPw, setShowPw] = useState(false);
  const [reg, { loading }] = useMutation(REGISTER);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await reg({ variables: form });
      login(data.register.token, data.register.user);
      toast.success('Account created — welcome aboard!');
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
          <h2>Join your team<br />in seconds.</h2>
          <p>Create your account and start tracking attendance, requesting leave, and staying in sync with your organization.</p>
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
            <h1>Create your account</h1>
            <p>Get started with your workspace</p>
          </div>
          <form onSubmit={submit} className="form">
            <label>Full name</label>
            <div className="field">
              <User size={18} className="field-ico" />
              <input required placeholder="Jane Doe" value={form.name} onChange={set('name')} />
            </div>

            <label>Email address</label>
            <div className="field">
              <Mail size={18} className="field-ico" />
              <input type="email" required placeholder="you@company.com" value={form.email} onChange={set('email')} />
            </div>

            <label>Password (min 6 characters)</label>
            <div className="field">
              <Lock size={18} className="field-ico" />
              <input
                type={showPw ? 'text' : 'password'} required minLength={6} placeholder="••••••••"
                value={form.password} onChange={set('password')}
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => !s)} aria-label="Toggle password">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="row">
              <div>
                <label>Department</label>
                <div className="field">
                  <Building2 size={18} className="field-ico" />
                  <input placeholder="Engineering" value={form.department} onChange={set('department')} />
                </div>
              </div>
              <div>
                <label>Position</label>
                <div className="field">
                  <Briefcase size={18} className="field-ico" />
                  <input placeholder="Software Engineer" value={form.position} onChange={set('position')} />
                </div>
              </div>
            </div>

            <button className="btn btn-primary full btn-lg" disabled={loading} style={{ marginTop: 22 }}>
              {loading ? 'Creating account…' : <>Create account <ArrowRight size={18} /></>}
            </button>
            <div className="form-foot">
              Already registered? <Link to="/login">Sign in</Link>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
