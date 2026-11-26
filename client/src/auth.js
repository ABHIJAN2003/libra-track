export const getToken = () => localStorage.getItem('token');
export const getRole = () => localStorage.getItem('role');
export const getUsername = () => localStorage.getItem('username');
export const getName = () => localStorage.getItem('name') || localStorage.getItem('username');
export const isLoggedIn = () => Boolean(getToken());
export const isAdmin = () => getRole() === 'admin';
// A member is a borrower who can see only their own books
export const isMember = () => localStorage.getItem('member') === 'yes';

export const saveLogin = ({ token, role, username, name, isMember }) => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  localStorage.setItem('username', username);
  localStorage.setItem('name', name || username);
  localStorage.setItem('member', isMember ? 'yes' : 'no');
};

export const logout = () => localStorage.clear();
