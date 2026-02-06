import { useNavigate } from 'react-router-dom';
import { logout } from '../api/logoutApi';

export default function LogoutButton({ className }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      // Даже если запрос упал — всё равно чистим токены
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    navigate('/login');
  };

  return (
    <button className={className} onClick={handleLogout}>
      🚪 Выйти
    </button>
  );
}