import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/recordAPI';
import { saveLogin } from '../auth';
import { BookMark } from '../components/Navbar';

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
      <section className="lt-login-art">
        <div className="lt-brand">
          <BookMark size={28} />
          LibraTrack
        </div>

        <div>
          <h1>Know who has which book, and when it is due.</h1>
          <p>Record every loan at the desk, find a borrower by name or mobile number, and mark books back as returned.</p>
        </div>

        <div className="lt-lendcard" aria-hidden="true">
          <div className="title">
            Clean Code
            <small>Robert C. Martin</small>
          </div>
          <div className="line"><span>Rahul Sen</span><span className="when">5 Dec</span></div>
          <div className="line void"><span>Meera Nair</span><span className="when">Returned</span></div>
          <div className="line"><span>Arjun Das</span><span className="when">19 Dec</span></div>
          <div className="line"></div>
        </div>
      </section>

      <section className="lt-login-form">
        <form onSubmit={handleSubmit} noValidate>
          <h2>Sign in</h2>
          <p className="intro">Use the account the library desk gave you.</p>

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
        </form>
      </section>
    </div>
  );
}