import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createRecord, getRecord, updateRecord } from '../api/recordAPI';

const emptyForm = {
  borrowerName: '',
  mobile: '',
  email: '',
  department: '',
  bookTitle: '',
  dueDate: '',
};

export default function RecordForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  // In edit mode, load the existing record
  useEffect(() => {
    if (!isEdit) return;
    getRecord(id)
      .then((res) => {
        const r = res.data;
        setForm({
          borrowerName: r.borrowerName,
          mobile: r.mobile,
          email: r.email || '',
          department: r.department || '',
          bookTitle: r.bookTitle,
          dueDate: r.dueDate.slice(0, 10), // yyyy-mm-dd for the date input
        });
      })
      .catch((err) => setServerError(err.response?.data?.message || 'Could not load this record.'));
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.borrowerName.trim()) e.borrowerName = 'Enter the borrower name.';
    if (!/^\d{10}$/.test(form.mobile)) e.mobile = 'Mobile must be exactly 10 digits.';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = 'Enter a valid email, like name@example.com.';
    if (!form.bookTitle.trim()) e.bookTitle = 'Enter the book title.';
    if (!form.dueDate) e.dueDate = 'Choose a due date.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      setSaving(true);
      if (isEdit) await updateRecord(id, form);
      else await createRecord(form);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Could not save the record.');
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, { type = 'text', hint, col = 'col-12', ...extra } = {}) => (
    <div className={col}>
      <label className="form-label" htmlFor={name}>{label}</label>
      <input
        id={name}
        type={type}
        name={name}
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
    <>
      <Navbar />
      <main className="container lt-page" style={{ maxWidth: 680 }}>
        <Link to="/" className="lt-back">&larr; Back to issue desk</Link>
        <div className="lt-card lt-slip">
          <header className="lt-slip-head">
            <div>
              <h1>{isEdit ? 'Edit record' : 'Add record'}</h1>
              <p>{isEdit ? 'Update the details of this loan.' : 'Log a book that is going out.'}</p>
            </div>
          </header>

          {serverError && <div className="alert alert-danger mt-3" role="alert">{serverError}</div>}

          <form onSubmit={handleSubmit} noValidate className="row g-3 mt-1">
            {field('bookTitle', 'Book title')}
            {field('borrowerName', 'Borrower name', { col: 'col-md-6' })}
            {field('mobile', 'Mobile', { col: 'col-md-6', maxLength: 10, inputMode: 'numeric', hint: '10 digits' })}
            {field('email', 'Email (optional)', { type: 'email', col: 'col-md-6' })}
            {field('department', 'Department or class (optional)', { col: 'col-md-6' })}
            {field('dueDate', 'Due date', { type: 'date', col: 'col-md-6' })}
            <div className="col-12 d-flex gap-2 mt-4">
              <button className="btn btn-primary px-4" disabled={saving}>
                {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Save record'}
              </button>
              <Link to="/" className="btn btn-outline-secondary">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}