import { useNavigate } from 'react-router-dom';
import Button from '../../../shared/ui/InitPage/Button';
import Container from '../../../shared/ui/InitPage/Container';
import styles from './Hero.module.css';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className={styles.hero}>
      <Container>
        <div className={styles.badge}>50K+ ACTIVE TRAVELERS</div>
        
        <h1 className={styles.title}>
          Share Your <span className={styles.accent}>Journey</span>
        </h1>
        
        <p className={styles.subtitle}>
          Connect with travelers, plan your trips, and discover hidden gems around the world
        </p>
        
        <div className={styles.buttons}>
          <Button variant="primary" onClick={() => navigate('/register')}>
            Get Started Free
          </Button>
          <Button variant="secondary" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>
      </Container>
    </section>
  );
}