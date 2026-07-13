import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
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
      toast.success(`Welcome back, ${data.login.user.name}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-icon big">🕐</span>
          <h1>AttendPro</h1>
          <p>Employee Attendance & Leave Platform</p>
        </div>
        <form onSubmit={submit} className="form">
          <h2>Sign in to your account</h2>
          <label>Email</label>
          <input
            type="email" required placeholder="you@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <label>Password</label>
          <input
            type="password" required placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button className="btn btn-primary full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <div className="form-foot">
            No account? <Link to="/register">Create one</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
