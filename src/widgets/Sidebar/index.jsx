import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import LogoutButton from '../../features/auth/logout/ui/LogoutButton';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: '🏠', label: 'Главная', path: '/home' },
    { icon: '📰', label: 'Лента Новостей', path: '/feed' },
    { icon: '💬', label: 'Сообщения', path: '/messages' },
    { icon: '🗺️', label: 'Мои маршруты', path: '/trips' },
    { icon: '❤️', label: 'Вишлист', path: '/wishlist' },
    { icon: '🔖', label: 'Сохраненные', path: '/saved' },
    { icon: '⚙️', label: 'Настройки', path: '/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={styles.sidebar}>
      {/* Логотип */}
      <div className={styles.logo}>
        <h1>TravelFlow</h1>
      </div>

      {/* Профиль пользователя (мини) */}
      <div className={styles.userCard} onClick={() => navigate('/profile')}>
        <img 
          src="https://via.placeholder.com/60" 
          alt="User"
          className={styles.avatar}
        />
        <div className={styles.userInfo}>
          <div className={styles.userName}>Sarah</div>
          <div className={styles.userBadge}>
            ⭐ Супер-турист
          </div>
        </div>
      </div>

      {/* Статистика (мини) */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statValue}>24</div>
          <div className={styles.statLabel}>Страны</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>47</div>
          <div className={styles.statLabel}>Поездки</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>2.4K</div>
          <div className={styles.statLabel}>Друзья</div>
        </div>
      </div>

      {/* Навигация */}
      <nav className={styles.nav}>
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}
      </nav>

      <LogoutButton className={styles.logoutBtn} />
    </aside>
  );
}