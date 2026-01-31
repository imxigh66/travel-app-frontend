import Button from '../../../shared/ui/InitPage/Button';
import Container from '../../../shared/ui/InitPage/Container';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <Container>
        <div className={styles.content}>
          <div className={styles.badge}>50K+ ACTIVE TRAVELERS</div>
          
          <h1 className={styles.title}>
            Share Your <br />
            <span className={styles.titleAccent}>Journey</span>
          </h1>
          
          <p className={styles.subtitle}>
            Connect with travelers worldwide and plan your dream trips together
          </p>
          
          <div className={styles.buttons}>
            <Button variant="primary">Join the Community</Button>
            <Button variant="secondary">Explore Stories</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}