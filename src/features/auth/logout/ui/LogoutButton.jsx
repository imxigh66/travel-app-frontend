import { useNavigate } from 'react-router-dom';
import { logout } from '../api/logoutApi';

export default function LogoutButton({ className, collapsed }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
    navigate('/login');
  };

  return (
    <button className={className} onClick={handleLogout}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      {!collapsed && 'Выйти'}
    </button>
  );
}