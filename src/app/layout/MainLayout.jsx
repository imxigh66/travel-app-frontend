import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../widgets/Sidebar';
import styles from './MainLayout.module.css';

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <main className={`${styles.content} ${collapsed ? styles.collapsed : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}