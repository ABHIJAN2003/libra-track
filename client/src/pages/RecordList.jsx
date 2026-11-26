import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getRecords, getStats, updateStatus, deleteRecord } from '../api/recordAPI';
import { isAdmin, isMember } from '../auth';

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// whole days a still-issued book is past its due date (0 if not late)
const daysLate = (r) => {
  if (r.status !== 'Issued') return 0;
  const due = new Date(r.dueDate);
  due.setHours(23, 59, 59, 999);
  const diff = Math.floor((Date.now() - due.getTime()) / 86400000) + 1;
  return diff > 0 ? diff : 0;
};

const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'Issued', label: 'Issued' },
  { value: 'Returned', label: 'Returned' },
];

export default function RecordList() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ total: 0, issued: 0, returned: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const admin = isAdmin();
  const member = isMember();

  const load = async () => {
    try {
      setError('');
      const [r, s] = await Promise.all([getRecords({ search, status }), getStats()]);
      setRecords(r.data);
      setStats(s.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load records.');
    } finally {
      setLoading(false);
    }
  };

  // Reload when search/filter changes (waits 300ms while typing)
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  const toggleStatus = async (r) => {
    try {
      await updateStatus(r._id, r.status === 'Issued' ? 'Returned' : 'Issued');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not change the status.');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await deleteRecord(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the record.');
    }
  };

  const filtering = Boolean(search || status);

  return (
    <>
      <Navbar />
      <main className="container lt-page">
        <div className="lt-page-head">
          <h1>{member ? 'My books' : 'Issue desk'}</h1>
          <p>{member ? 'Your loans and when each one is due.' : 'Books out on loan, and who has them.'}</p>
        </div>

        <section className="lt-ledger" aria-label="Summary">
          <div>
            <div className="num">{stats.total}</div>
            <div className="lbl">{member ? 'All my loans' : 'All records'}</div>
          </div>
          <div className="out">
            <div className="num">{stats.issued}</div>
            <div className="lbl">Out on loan</div>
          </div>
          <div className="back">
            <div className="num">{stats.returned}</div>
            <div className="lbl">Returned</div>
          </div>
        </section>

        <div className="lt-toolbar">
          <div className="lt-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              className="form-control"
              placeholder="Search by name or mobile"
              aria-label="Search by name or mobile"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="lt-tabs" role="group" aria-label="Filter by status">
            {FILTERS.map((f) => (
              <button key={f.label} aria-pressed={status === f.value} onClick={() => setStatus(f.value)}>
                {f.label}
              </button>
            ))}
          </div>

          <div className="lt-spacer" />
          {admin && <Link to="/records/new" className="btn btn-primary">Add record</Link>}
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        <div className="lt-table-wrap">
          <div className="table-responsive">
            <table className="lt-table">
              <thead>
                <tr>
                  <th>Borrower</th>
                  <th>Book</th>
                  <th>Mobile</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="lt-empty">Loading records...</td></tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="lt-empty">
                      <strong>{filtering ? 'No records match' : 'No records yet'}</strong>
                      {filtering
                        ? 'Clear the search or choose All to see every record.'
                        : admin
                          ? 'Use Add record to log the first book that goes out.'
                          : member
                            ? 'Books show up here once the library desk records a loan under your mobile number.'
                            : 'Records appear here once the librarian adds them.'}
                    </td>
                  </tr>
                ) : (
                  records.map((r) => {
                    const late = daysLate(r);
                    return (
                      <tr key={r._id}>
                        <td>
                          <div className="lt-person">
                            <span className="lt-avatar" aria-hidden="true">{initials(r.borrowerName)}</span>
                            <div>
                              <div className="name">{r.borrowerName}</div>
                              {r.department && <div className="sub">{r.department}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="lt-book">{r.bookTitle}</td>
                        <td>{r.mobile}</td>
                        <td>
                          <div>{fmt(r.dueDate)}</div>
                          {late > 0 && <div className="lt-late">{late} {late === 1 ? 'day' : 'days'} overdue</div>}
                        </td>
                        <td>
                          <span className={`stamp ${r.status === 'Returned' ? 'returned' : late > 0 ? 'overdue' : 'issued'}`}>
                            {r.status === 'Issued' && late > 0 ? 'Overdue' : r.status}
                          </span>
                        </td>
                        <td className="lt-actions">
                          <Link to={`/records/${r._id}`} className="lt-act">View</Link>
                          {admin && (
                            <>
                              <button className="lt-act" onClick={() => toggleStatus(r)}>
                                {r.status === 'Issued' ? 'Mark returned' : 'Re-issue'}
                              </button>
                              <Link to={`/records/${r._id}/edit`} className="lt-act">Edit</Link>
                              <button className="lt-act danger" onClick={() => remove(r._id)}>Delete</button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}