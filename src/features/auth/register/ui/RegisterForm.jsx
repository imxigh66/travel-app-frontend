import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../../shared/ui/AuthInput';
import Button from '../../../../shared/ui/Button';
import Select from '../../../../shared/ui/AuthSelect';
import { registerUser } from '../api/registerApi';
import styles from './RegisterForm.module.css';

/**
 * OPTIONS
 */
const ACCOUNT_TYPES = [
  { value: 'Personal', label: 'Personal account' },
  { value: 'Business', label: 'Business account' },
];

const TRAVEL_INTERESTS = [
  { value: 'Nature', label: 'Nature' },
  { value: 'Food', label: 'Food' },
  { value: 'Adventure', label: 'Adventure' },
  { value: 'Culture', label: 'Culture' },
  { value: 'CityLife', label: 'City life' },
  { value: 'Relax', label: 'Relax' },
  { value: 'Photography', label: 'Photography' },
];

const TRAVEL_STYLES = [
  { value: 'FoodSeeker', label: 'Food seeker' },
  { value: 'CultureExplorer', label: 'Culture explorer' },
  { value: 'DigitalNomad', label: 'Digital nomad' },
  { value: 'Backpacker', label: 'Backpacker' },
  { value: 'LuxuryTraveler', label: 'Luxury traveler' },
  { value: 'SlowTraveler', label: 'Slow traveler' },
  { value: 'Adventurer', label: 'Adventurer' },
];

export default function RegisterForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',

    accountType: 'Personal',
    travelInterest: '',
    travelStyle: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

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

    if (formData.accountType === 'Personal') {
      if (!formData.travelInterest) {
        newErrors.travelInterest = 'Select travel interest';
      }
      if (!formData.travelStyle) {
        newErrors.travelStyle = 'Select travel style';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      name: formData.name,
      accountType: formData.accountType,
    };

    if (formData.accountType === 'Personal') {
      payload.travelInterest = formData.travelInterest;
      payload.travelStyle = formData.travelStyle;
    }

    const result = await registerUser(payload);

    setLoading(false);

    if (result.success) {
      alert('Registration successful! Please check your email.');
      navigate('/login');
    } else {
      setErrors({ submit: result.error || 'Registration failed' });
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
      />

      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />

      <Input
        label="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
      />

      <Input
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
      />

      <Select
  label="Account type"
  name="accountType"
  value={formData.accountType}
  onChange={handleChange}
  options={ACCOUNT_TYPES}
/>

      {/* PERSONAL ONLY */}
     {formData.accountType === 'Personal' && (
  <>
    <Select
      label="Travel interest"
      name="travelInterest"
      value={formData.travelInterest}
      onChange={handleChange}
      options={TRAVEL_INTERESTS}
      error={errors.travelInterest}
    />

    <Select
      label="Travel style"
      name="travelStyle"
      value={formData.travelStyle}
      onChange={handleChange}
      options={TRAVEL_STYLES}
      error={errors.travelStyle}
    />
  </>
)}

      {errors.submit && (
        <div className={styles.errorMessage}>{errors.submit}</div>
      )}

      <Button variant="auth" type="submit" disabled={loading}>
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
