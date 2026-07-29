import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import LanguageMenu from '../components/ui/LanguageMenu';
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
  const { t } = useLang();
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', position: '' });
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
            <button className="tl-cta" type="button" onClick={() => navigate('/login')}>{t('reg.signin')}</button>
          </nav>
        </header>

        <section className="tl-hero">
          <button className="tl-badge" type="button" onClick={() => navigate('/login')}>
            <span><strong>{t('login.badge')}</strong> <span className="dim">{t('login.badgeSub')}</span></span>
            <span className="tl-badge-arrow"><ArrowUpRight size={18} /></span>
          </button>

          <h1 className="tl-title">
            <span className="tl-underline">
              {t('reg.titleA')}
              <svg viewBox="0 0 300 130" aria-hidden="true">
                <path d="M70 22c-40 6-58 40-46 66 12 26 76 34 130 30 54-4 106-20 116-46 9-24-20-50-70-58-42-7-92-2-120 8" />
              </svg>
            </span>{' '}
            {t('reg.titleB')}
          </h1>

          <p className="tl-sub">{t('reg.sub')}</p>
        </section>

        <form className="tl-form-solo" onSubmit={submit}>
          <input className="tl-field" required aria-label={t('reg.name')} placeholder={t('reg.name')} value={form.name} onChange={set('name')} />
          <input className="tl-field" type="email" required aria-label={t('reg.email')} placeholder={t('reg.email')} value={form.email} onChange={set('email')} />
          <input className="tl-field" type="password" required minLength={6} aria-label={t('reg.password')} placeholder={t('reg.password')} value={form.password} onChange={set('password')} />
          <div className="tl-row2">
            <input className="tl-field" aria-label={t('reg.department')} placeholder={t('reg.department')} value={form.department} onChange={set('department')} />
            <input className="tl-field" aria-label={t('reg.position')} placeholder={t('reg.position')} value={form.position} onChange={set('position')} />
          </div>
          <button className="tl-submit" type="submit" disabled={loading}>
            {loading ? '…' : t('reg.submit')} <ArrowRight size={20} />
          </button>
          <div className="tl-signin-row">
            {t('reg.already')} <Link to="/login">{t('reg.signin')}</Link>
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
