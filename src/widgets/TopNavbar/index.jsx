import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../entities/user/api/userApi';
import UserAvatar from '../../entities/user/ui/UserAvatar';
import styles from './TopNavbar.module.css';

export default function TopNavbar({ onUserLoad, collapsed = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const result = await getCurrentUser(); // Получаем { success, data, error }
      
      if (result.success && result.data) {
        setCurrentUser(result.data);
        
        if (onUserLoad) {
          onUserLoad(result.data);
        }
      } else {
        console.error('Failed to fetch user:', result.error);
        navigate('/login');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleAvatarClick = () => {
    navigate('/profile');
  };

  if (isLoading) {
    return (
      <header className={`${styles.navbar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.container}>
          <div className={styles.rightSection}>
            <div className={styles.searchForm}>
              <div className={styles.searchWrapper}>
                <SearchIcon />
                <input
                  type="text"
                  placeholder="search..."
                  disabled
                  className={styles.searchInput}
                />
              </div>
            </div>
            
            <div className={styles.avatarSkeleton} />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`${styles.navbar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.container}>
        <div className={styles.rightSection}>
          {/* Search Bar */}
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <div className={styles.searchWrapper}>
              <SearchIcon />
              <input
                type="text"
                placeholder="search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </form>

          {/* User Avatar */}
          {currentUser && (
            <UserAvatar
              user={currentUser}
              size="medium"
              onClick={handleAvatarClick}
            />
          )}
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  );
}