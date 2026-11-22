import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getRecord } from '../api/recordAPI';
import { isAdmin } from '../auth';

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function RecordDetails() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getRecord(id)
      .then((res) => setRecord(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load this record.'));
  }, [id]);

  const rows = record
    ? [
        ['Borrower', record.borrowerName],
        ['Mobile', record.mobile],
        ['Email', record.email || 'Not given'],
        ['Department or class', record.department || 'Not given'],
        ['Issued on', new Date(record.issueDateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })],
        ['Due date', fmtDate(record.dueDate)],
      ]
    : [];

  return (
    <>
      <Navbar />
      <main className="container lt-page" style={{ maxWidth: 720 }}>
        <Link to="/" className="lt-back">&larr; Back to issue desk</Link>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        {record && (
          <article className="lt-card lt-slip">
            <header className="lt-slip-head">
              <div>
                <h1>{record.bookTitle}</h1>
                <p>Borrowed by {record.borrowerName}</p>
              </div>
              <span className={`stamp ${record.status === 'Returned' ? 'returned' : 'issued'}`}>{record.status}</span>
            </header>

            <dl className="lt-rows">
              {rows.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            {isAdmin() && (
              <div className="mt-3">
                <Link to={`/records/${record._id}/edit`} className="btn btn-primary">Edit record</Link>
              </div>
            )}
          </article>
        )}
      </main>
    </>
  );
}