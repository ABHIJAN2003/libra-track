import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/recordAPI';
import { saveLogin } from '../auth';
import AuthArt from '../components/AuthArt';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username.trim() || !form.password) {
      setError('Enter your username and password.');
      return;
    }
    try {
      setLoading(true);
      const res = await loginUser({ username: form.username.trim(), password: form.password });
      saveLogin(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the server. Check that it is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lt-login">
      <AuthArt />

      <section className="lt-login-form">
        <form onSubmit={handleSubmit} noValidate>
          <h2>Sign in</h2>
          <p className="intro">Use the username and password you registered with.</p>

          {error && <div className="alert alert-danger" role="alert">{error}</div>}

          <div className="mb-3">
            <label className="form-label" htmlFor="username">Username</label>
            <input id="username" className="form-control" name="username" autoComplete="username" value={form.username} onChange={handleChange} />
          </div>
          <div className="mb-4">
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" type="password" className="form-control" name="password" autoComplete="current-password" value={form.password} onChange={handleChange} />
          </div>
          <button className="btn btn-primary w-100 py-2" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="lt-switch">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </section>
    </div>
  );
}