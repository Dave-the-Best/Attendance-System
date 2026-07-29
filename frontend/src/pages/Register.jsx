import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { Clock4, User, Mail, Lock, Building2, Briefcase, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { duration, ease } from '../lib/motion';
import AuthShowcase from '../components/auth/AuthShowcase';
import toast from 'react-hot-toast';

const REGISTER = gql`
  mutation Register($name: String!, $email: String!, $password: String!, $department: String, $position: String) {
    register(name: $name, email: $email, password: $password, department: $department, position: $position) {
      token
      user { id name email role department position }
    }
  }
`;

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
      toast.success('Account created — welcome aboard');
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
        <AuthShowcase />
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
            <h1>Create your account</h1>
            <p>Get started with your workspace.</p>
          </div>
          <form onSubmit={submit} className="form">
            <label htmlFor="name">Full name</label>
            <div className="field">
              <User size={17} className="field-ico" />
              <input id="name" required placeholder="Jane Doe" value={form.name} onChange={set('name')} />
            </div>

            <label htmlFor="remail">Email address</label>
            <div className="field">
              <Mail size={17} className="field-ico" />
              <input id="remail" type="email" required placeholder="you@company.com" value={form.email} onChange={set('email')} />
            </div>

            <label htmlFor="rpassword">Password (min 6 characters)</label>
            <div className="field">
              <Lock size={17} className="field-ico" />
              <input id="rpassword" type={showPw ? 'text' : 'password'} required minLength={6} placeholder="••••••••"
                value={form.password} onChange={set('password')} />
              <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <div className="row">
              <div>
                <label htmlFor="dept">Department</label>
                <div className="field">
                  <Building2 size={17} className="field-ico" />
                  <input id="dept" placeholder="Engineering" value={form.department} onChange={set('department')} />
                </div>
              </div>
              <div>
                <label htmlFor="pos">Position</label>
                <div className="field">
                  <Briefcase size={17} className="field-ico" />
                  <input id="pos" placeholder="Software Engineer" value={form.position} onChange={set('position')} />
                </div>
              </div>
            </div>

            <button className="btn btn-primary full btn-lg mt-5" disabled={loading}>
              {loading ? 'Creating account…' : <>Create account <ArrowRight size={17} /></>}
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
