import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
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

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', position: '' });
  const [reg, { loading }] = useMutation(REGISTER);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await reg({ variables: form });
      login(data.register.token, data.register.user);
      toast.success('Account created');
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
          <h1>Create your account</h1>
          <p>Join your team on AttendPro</p>
        </div>
        <form onSubmit={submit} className="form">
          <label>Full name</label>
          <input required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <label>Email</label>
          <input type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />

          <label>Password (min 6 chars)</label>
          <input type="password" required minLength={6} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />

          <div className="row">
            <div>
              <label>Department</label>
              <input value={form.department} placeholder="Engineering"
                onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
            <div>
              <label>Position</label>
              <input value={form.position} placeholder="Software Engineer"
                onChange={(e) => setForm({ ...form, position: e.target.value })} />
            </div>
          </div>

          <button className="btn btn-primary full" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
          <div className="form-foot">
            Already registered? <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
