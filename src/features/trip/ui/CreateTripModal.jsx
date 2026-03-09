import { useState } from 'react';
import { tripApi } from '../../../entities/trip/api/tripApi';
import styles from './CreateTripModal.module.css';

const STATUS_OPTIONS = [
  { value: 0, label: '📅 Запланировано' },
  { value: 1, label: '✈️ В процессе' },
  { value: 2, label: '✅ Завершено' },
];

export function CreateTripModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    city: '',
    countryCode: '',
    tripDate: '',
    isPublic: true,
    status: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.city.trim() || !form.countryCode.trim() || !form.tripDate) {
      setError('Заполните обязательные поля');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const trip = await tripApi.createTrip({
        ...form,
        countryCode: form.countryCode.toUpperCase().slice(0, 2),
      });
      onCreate?.(trip);
      onClose();
    } catch {
      setError('Не удалось создать поездку');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Новая поездка</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Название */}
          <div className={styles.field}>
            <label className={styles.label}>Название *</label>
            <input
              className={styles.input}
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Поездка в Париж"
              maxLength={150}
            />
          </div>

          {/* Описание */}
          <div className={styles.field}>
            <label className={styles.label}>Описание</label>
            <textarea
              className={styles.textarea}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Расскажите о поездке..."
              rows={3}
            />
          </div>

          {/* Город и код страны */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Город *</label>
              <input
                className={styles.input}
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Париж"
              />
            </div>
            <div className={`${styles.field} ${styles.fieldSmall}`}>
              <label className={styles.label}>Код страны *</label>
              <input
                className={styles.input}
                name="countryCode"
                value={form.countryCode}
                onChange={handleChange}
                placeholder="FR"
                maxLength={2}
              />
            </div>
          </div>

          {/* Дата */}
          <div className={styles.field}>
            <label className={styles.label}>Дата поездки *</label>
            <input
              className={styles.input}
              type="date"
              name="tripDate"
              value={form.tripDate}
              onChange={handleChange}
            />
          </div>

          {/* Статус */}
          <div className={styles.field}>
            <label className={styles.label}>Статус</label>
            <select
              className={styles.select}
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Публичность */}
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="isPublic"
              checked={form.isPublic}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <span>Публичная поездка (видна другим)</span>
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Создание...' : 'Создать поездку'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}