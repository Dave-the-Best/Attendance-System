import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { Globe, ChevronDown, ArrowRight, ArrowUpRight } from 'lucide-react';
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

// Brand marks for the social sign-in buttons (nominative use).
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
    <path d="M13.5 22v-8h2.7l.4-3.13h-3.1V8.87c0-.9.25-1.52 1.55-1.52h1.65V4.56c-.28-.04-1.26-.12-2.4-.12-2.37 0-4 1.45-4 4.11v2.32H7.6V14h2.7v8h3.2z" />
  </svg>
);
const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 22 24" aria-hidden="true" fill="currentColor">
    <path d="M16.36 12.68c-.03-2.82 2.3-4.17 2.4-4.24-1.31-1.91-3.34-2.17-4.06-2.2-1.73-.17-3.37 1.02-4.25 1.02-.87 0-2.22-.99-3.65-.97-1.88.03-3.61 1.09-4.58 2.77-1.95 3.39-.5 8.4 1.4 11.15.93 1.35 2.03 2.86 3.48 2.8 1.39-.05 1.92-.9 3.6-.9 1.68 0 2.16.9 3.63.88 1.5-.03 2.45-1.37 3.37-2.72.98-1.4 1.38-2.75 1.4-2.82-.03-.01-2.68-1.03-2.71-4.07zM13.9 4.38c.77-.93 1.29-2.23 1.15-3.52-1.11.05-2.46.74-3.25 1.67-.71.82-1.33 2.14-1.16 3.4 1.24.1 2.5-.63 3.26-1.55z" />
  </svg>
);

const NOT_CONFIGURED = 'Social sign-in isn’t set up for this workspace yet.';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
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
    <motion.div className="tract-login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="tl-panel">
        {/* Nav */}
        <header className="tl-nav">
          <div className="tl-brand-wrap">
            <span className="tl-brand">attendpro.</span>
            <span className="tl-brand-mail"><span className="sl">/</span>support@attendpro.com</span>
          </div>
          <nav className="tl-nav-right">
            <button className="tl-lang" type="button" onClick={() => toast('Only English is available right now.')}>
              <Globe size={17} /> En <ChevronDown size={14} />
            </button>
            <Link to="/login" className="tl-navlink">Sign In</Link>
            <button className="tl-cta" type="button" onClick={() => navigate('/register')}>Get Started</button>
          </nav>
        </header>

        {/* Hero */}
        <section className="tl-hero">
          <button className="tl-badge" type="button" onClick={() => navigate('/register')}>
            <span><strong>New to AttendPro?</strong> <span className="dim">See how teams track time with it.</span></span>
            <span className="tl-badge-arrow"><ArrowUpRight size={18} /></span>
          </button>

          <h1 className="tl-title">
            <span className="tl-underline">
              Login
              <svg viewBox="0 0 300 130" aria-hidden="true">
                <path d="M70 22c-40 6-58 40-46 66 12 26 76 34 130 30 54-4 106-20 116-46 9-24-20-50-70-58-42-7-92-2-120 8" />
              </svg>
            </span>{' '}
            to Your
            <br />Account
          </h1>

          <p className="tl-sub">Track time, manage leave, and keep your whole team in sync — from one clean workspace.</p>
        </section>

        {/* Form + social */}
        <form className="tl-form" onSubmit={submit}>
          <div className="tl-col">
            <input
              className="tl-field" type="email" required autoComplete="email" aria-label="Email address"
              placeholder="Phone / Email / Employee ID"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="tl-field" type="password" required autoComplete="current-password" aria-label="Passcode"
              placeholder="Passcode"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button className="tl-submit" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Login to Your Account'} <ArrowRight size={20} />
            </button>
            <button className="tl-forgot" type="button" onClick={() => toast('Password reset isn’t available yet — ask your admin.')}>
              Forgot Passcode?
            </button>
          </div>

          <div className="tl-divider" aria-hidden="true">/</div>

          <div className="tl-col">
            <button className="tl-social" type="button" onClick={() => toast(NOT_CONFIGURED)}>
              <span className="tl-social-ico"><GoogleIcon /></span> Sign in with Google Account
            </button>
            <button className="tl-social" type="button" onClick={() => toast(NOT_CONFIGURED)}>
              <span className="tl-social-ico"><FacebookIcon /></span> Sign in Facebook Account
            </button>
            <button className="tl-social" type="button" onClick={() => toast(NOT_CONFIGURED)}>
              <span className="tl-social-ico"><AppleIcon /></span> Sign in Apple Secure ID
            </button>
          </div>
        </form>

        {/* Footer */}
        <footer className="tl-footer">
          <div className="tl-foot-links">
            <a>Privacy Policy</a>
            <span className="bar">|</span>
            <a>Terms &amp; Conditions</a>
          </div>
          <div className="tl-copy">Copyright © AttendPro {new Date().getFullYear()}</div>
        </footer>
      </div>
    </motion.div>
  );
}
