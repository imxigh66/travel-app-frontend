import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../../shared/ui/Input';
import Button from '../../../../shared/ui/InitPage/Button';
import { registerUser } from '../api/registerApi';
import styles from './RegisterForm.module.css';

export default function RegisterForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    
    const result = await registerUser({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      name: formData.name,
    });
    
    setLoading(false);
    
    if (result.success) {
      // Показываем сообщение об успехе
      alert('Registration successful! Please check your email to confirm your account.');
      navigate('/login');
    } else {
      setErrors({ submit: result.error });
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        label="Full Name"
        name="name"
        placeholder="Enter your full name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
      />

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
        label="Username"
        name="username"
        placeholder="Choose a unique username"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
      />

      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="Create a strong password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
      />

      {errors.submit && (
        <div className={styles.errorMessage}>{errors.submit}</div>
      )}

      <Button 
        variant="primary" 
        type="submit"
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>

      <div className={styles.footer}>
        Already have an account?{' '}
        <span className={styles.link} onClick={() => navigate('/login')}>
          Sign in
        </span>
      </div>
    </form>
  );
}