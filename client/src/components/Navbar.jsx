import { Link, useNavigate } from 'react-router-dom';
import { getName, getRole, isMember, logout } from '../auth';

export function BookMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5v-15Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 7.5h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const name = getName() || '';
  const role = getRole();
  const roleLabel = role === 'admin' ? 'Librarian' : isMember() ? 'Member' : 'View only';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="lt-nav">
      <div className="container wrap">
        <Link to="/" className="lt-brand">
          <BookMark />
          LibraTrack
        </Link>
        <div className="lt-user">
          <span className="lt-avatar" aria-hidden="true">
            {name.charAt(0).toUpperCase()}
          </span>
          <span className="d-none d-sm-block" style={{ lineHeight: 1.2 }}>
            <span style={{ display: 'block', fontWeight: 600 }}>{name}</span>
            <span className="lt-role">{roleLabel}</span>
          </span>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}