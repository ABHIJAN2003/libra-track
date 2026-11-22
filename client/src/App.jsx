import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RecordList from './pages/RecordList';
import RecordDetails from './pages/RecordDetails';
import RecordForm from './pages/RecordForm';
import { isLoggedIn, isAdmin } from './auth';

// Only logged-in users
function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

// Only admins
function AdminRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return isAdmin() ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><RecordList /></PrivateRoute>} />
      <Route path="/records/new" element={<AdminRoute><RecordForm /></AdminRoute>} />
      <Route path="/records/:id" element={<PrivateRoute><RecordDetails /></PrivateRoute>} />
      <Route path="/records/:id/edit" element={<AdminRoute><RecordForm /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
