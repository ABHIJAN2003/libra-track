export const getToken = () => localStorage.getItem('token');
export const getRole = () => localStorage.getItem('role');
export const getUsername = () => localStorage.getItem('username');
export const isLoggedIn = () => Boolean(getToken());
export const isAdmin = () => getRole() === 'admin';

export const saveLogin = ({ token, role, username }) => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  localStorage.setItem('username', username);
};

export const logout = () => localStorage.clear();
