import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../widgets/Sidebar';
import TopNavbar from '../../widgets/TopNavbar';
import styles from './MainLayout.module.css';

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleUserLoad = (user) => {
    setCurrentUser(user);
  };

  return (
    <div className={styles.layout}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={styles.mainArea}>
        <TopNavbar 
          collapsed={collapsed} 
          onUserLoad={handleUserLoad}
        />
        
        <main className={styles.content}>
          <Outlet context={{ currentUser }} />
        </main>
      </div>
    </div>
  );
}