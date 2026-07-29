import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import LanguageMenu from '../components/ui/LanguageMenu';
import toast from 'react-hot-toast';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user { id name email role department position }
    }
  }
`;

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
    <path d="M13.5 22v-8h2.7l.4-3.13h-3.1V8.87c0-.9.25-1.52 1.55-1.52h1.65V4.56c-.28-.04-1.26-.12-2.4-.12-2.37 0-4 1.45-4 4.11v2.32H7.6V14h2.7v8h3.2z" />
  </svg>
);

export default function Login() {
  const { t } = useLang();
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
        <header className="tl-nav">
          <div className="tl-brand-wrap">
            <span className="tl-brand">attendpro.</span>
            <span className="tl-brand-mail"><span className="sl">/</span>support@attendpro.com</span>
          </div>
          <nav className="tl-nav-right">
            <LanguageMenu variant="editorial" />
            <Link to="/login" className="tl-navlink">{t('nav.signin')}</Link>
            <button className="tl-cta" type="button" onClick={() => navigate('/register')}>{t('nav.getstarted')}</button>
          </nav>
        </header>

        <section className="tl-hero">
          <button className="tl-badge" type="button" onClick={() => navigate('/register')}>
            <span><strong>{t('login.badge')}</strong> <span className="dim">{t('login.badgeSub')}</span></span>
            <span className="tl-badge-arrow"><ArrowUpRight size={18} /></span>
          </button>

          <h1 className="tl-title">
            <span className="tl-underline">
              {t('login.titleA')}
              <svg viewBox="0 0 300 130" aria-hidden="true">
                <path d="M70 22c-40 6-58 40-46 66 12 26 76 34 130 30 54-4 106-20 116-46 9-24-20-50-70-58-42-7-92-2-120 8" />
              </svg>
            </span>{' '}
            {t('login.titleB')}
          </h1>

          <p className="tl-sub">{t('login.sub')}</p>
        </section>

        <form className="tl-form" onSubmit={submit}>
          <div className="tl-col">
            <input
              className="tl-field" type="email" required autoComplete="email" aria-label={t('reg.email')}
              placeholder={t('login.email')}
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="tl-field" type="password" required autoComplete="current-password" aria-label={t('login.passcode')}
              placeholder={t('login.passcode')}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button className="tl-submit" type="submit" disabled={loading}>
              {loading ? '…' : t('login.submit')} <ArrowRight size={20} />
            </button>
            <button className="tl-forgot" type="button" onClick={() => toast(t('toast.reset'))}>
              {t('login.forgot')}
            </button>
          </div>

          <div className="tl-divider" aria-hidden="true">/</div>

          <div className="tl-col">
            <button className="tl-social" type="button" onClick={() => toast(t('toast.sso'))}>
              <span className="tl-social-ico"><FacebookIcon /></span> {t('login.facebook')}
            </button>
          </div>
        </form>

        <footer className="tl-footer">
          <div className="tl-foot-links">
            <a>{t('common.privacy')}</a>
            <span className="bar">|</span>
            <a>{t('common.terms')}</a>
          </div>
          <div className="tl-copy">Copyright © AttendPro {new Date().getFullYear()}</div>
        </footer>
      </div>
    </motion.div>
  );
}
