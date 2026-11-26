import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/recordAPI';
import { saveLogin } from '../auth';
import AuthArt from '../components/AuthArt';

const emptyForm = {
  name: '',
  username: '',
  password: '',
  confirm: '',
  mobile: '',
  accessCode: '',
};

export default function Register() {
  const [type, setType] = useState('member');   // 'member' or 'librarian'
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Enter your name.';
    if (!/^[a-z0-9_]{3,30}$/.test(form.username.trim().toLowerCase()))
      e.username = '3 to 30 characters: letters, numbers and underscore only.';
    if (form.password.length < 6) e.password = 'Use at least 6 characters.';
    if (form.confirm !== form.password) e.confirm = 'The two passwords do not match.';
    if (type === 'member' && !/^\d{10}$/.test(form.mobile)) e.mobile = 'Mobile must be exactly 10 digits.';
    if (type === 'librarian' && !form.accessCode.trim()) e.accessCode = 'Enter the access code from the library.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      setLoading(true);
      const res = await registerUser({
        type,
        name: form.name.trim(),
        username: form.username.trim().toLowerCase(),
        password: form.password,
        mobile: form.mobile,
        accessCode: form.accessCode.trim(),
      });
      saveLogin(res.data);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Could not reach the server. Check that it is running.');
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, { type: inputType = 'text', hint, ...extra } = {}) => (
    <div className="mb-3">
      <label className="form-label" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={inputType}
        className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
        value={form[name]}
        onChange={handleChange}
        {...extra}
      />
      {errors[name]
        ? <div className="invalid-feedback">{errors[name]}</div>
        : hint && <div className="form-hint">{hint}</div>}
    </div>
  );

  return (
    <div className="lt-login">
      <AuthArt />

      <section className="lt-login-form">
        <form onSubmit={handleSubmit} noValidate>
          <h2>Create an account</h2>
          <p className="intro">
            {type === 'member'
              ? 'See the books you have borrowed and when they are due.'
              : 'Manage issue records for the library desk.'}
          </p>

          <div className="lt-tabs block mb-3" role="group" aria-label="Account type">
            <button type="button" aria-pressed={type === 'member'} onClick={() => setType('member')}>
              I borrow books
            </button>
            <button type="button" aria-pressed={type === 'librarian'} onClick={() => setType('librarian')}>
              I am a librarian
            </button>
          </div>

          {serverError && <div className="alert alert-danger" role="alert">{serverError}</div>}

          {field('name', 'Your name', { autoComplete: 'name' })}
          {field('username', 'Username', { autoComplete: 'username', autoCapitalize: 'none' })}

          {type === 'member' && field('mobile', 'Mobile number', {
            maxLength: 10,
            inputMode: 'numeric',
            hint: 'Use the number the library has on record for you. Your books are matched by this number.',
          })}
          {type === 'librarian' && field('accessCode', 'Librarian access code', {
            type: 'password',
            autoComplete: 'off',
            hint: 'Ask the head librarian for this code.',
          })}

          {field('password', 'Password', { type: 'password', autoComplete: 'new-password', hint: 'At least 6 characters.' })}
          {field('confirm', 'Confirm password', { type: 'password', autoComplete: 'new-password' })}

          <button className="btn btn-primary w-100 py-2 mt-2" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="lt-switch">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </div>
  );
}