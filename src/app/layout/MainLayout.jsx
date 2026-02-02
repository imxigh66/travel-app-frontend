import { Outlet } from 'react-router-dom';
import Sidebar from '../../widgets/Sidebar';
import styles from './MainLayout.module.css';

export default function MainLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      
      <main className={styles.content}>
        <Outlet />  {/* Сюда попадают все страницы */}
      </main>
    </div>
  );
}