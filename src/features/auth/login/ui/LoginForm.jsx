import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../../shared/ui/AuthInput';
import Button from '../../../../shared/ui/AuthButton';
import { loginUser } from '../api/loginApi';
import styles from './LoginForm.module.css';

export default function LoginForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    const result = await loginUser(formData);
    
    setLoading(false);
    
    if (result.success) {
      // Редирект на главную страницу приложения
      navigate('/profile'); 
    } else {
      setErrors({ submit: result.error });
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        label="Email Address"
        name="email"
        type="email"
        placeholder="your.email@example.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />

      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
      />

      {errors.submit && (
        <div className={styles.errorMessage}>{errors.submit}</div>
      )}

      <div className={styles.forgotPassword}>
        <span className={styles.link}>Forgot password?</span>
      </div>

      <Button 
        variant="primary" 
        type="submit"
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>

      <div className={styles.footer}>
        Don't have an account?{' '}
        <span className={styles.link} onClick={() => navigate('/register')}>
          Sign up
        </span>
      </div>
    </form>
  );
}
