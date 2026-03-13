import { useState } from 'react';
import api from '../../../shared/api/axios';
import styles from './SuggestPlaceModal.module.css';

// ── Данные из place.types.ts ──────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'Food',          label: '🍜 Еда' },
  { value: 'Accommodation', label: '🏨 Жильё' },
  { value: 'Culture',       label: '🏛️ Культура' },
  { value: 'Nature',        label: '🌿 Природа' },
  { value: 'Entertainment', label: '🎭 Развлечения' },
  { value: 'Shopping',      label: '🛍️ Шопинг' },
  { value: 'Transport',     label: '🚉 Транспорт' },
  { value: 'Services',      label: '🏦 Сервисы' },
];

const PLACE_TYPES_BY_CATEGORY = {
  Food:          [['Restaurant','Ресторан'],['Cafe','Кафе'],['Bar','Бар'],['FastFood','Фастфуд'],['Bakery','Пекарня']],
  Accommodation: [['Hotel','Отель'],['Hostel','Хостел'],['Apartment','Апартаменты'],['Guesthouse','Гестхаус'],['Resort','Курорт']],
  Culture:       [['Museum','Музей'],['Gallery','Галерея'],['Theater','Театр'],['Monument','Памятник'],['Library','Библиотека']],
  Nature:        [['Park','Парк'],['Beach','Пляж'],['Mountain','Гора'],['Forest','Лес'],['Lake','Озеро']],
  Entertainment: [['Cinema','Кино'],['NightClub','Клуб'],['Casino','Казино'],['AmusementPark','Парк аттракционов'],['Zoo','Зоопарк']],
  Shopping:      [['ShoppingMall','ТЦ'],['Market','Рынок'],['Boutique','Бутик'],['Supermarket','Супермаркет']],
  Transport:     [['Airport','Аэропорт'],['TrainStation','Ж/д вокзал'],['BusStation','Автовокзал'],['Port','Порт']],
  Services:      [['Hospital','Больница'],['Bank','Банк'],['PostOffice','Почта'],['TouristInfo','Турinfo']],
};

const MOODS = [
  ['WithCompany','👫 С компанией'],
  ['Solo','🧘 Один'],
  ['WithFamily','👨‍👩‍👧 С семьёй'],
  ['RomanticDate','💑 Вдвоём'],
  ['Special','🔥 Особенное'],
  ['Calm','😌 Тихо'],
  ['Active','⚡ Активно'],
  ['Cultural','🏛️ Культурно'],
  ['Foodie','🍽️ Поесть'],
  ['NightOut','🌙 Вечер'],
  ['Nature','🌿 Природа'],
];

const STEPS = ['Основное', 'Локация', 'Настроение', 'Фото'];

export default function SuggestPlaceModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    placeType: '',
    countryCode: '',
    city: '',
    address: '',
    moods: [],
    images: [],
  });

  if (!isOpen) return null;

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const toggleMood = (mood) => {
    setForm(f => ({
      ...f,
      moods: f.moods.includes(mood)
        ? f.moods.filter(m => m !== mood)
        : [...f.moods, mood],
    }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length + form.images.length > 5) {
      setError('Максимум 5 фотографий');
      return;
    }
    setError('');
    setForm(f => ({ ...f, images: [...f.images, ...files].slice(0, 5) }));
  };

  const removeImage = (idx) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  // ── Валидация по шагам ────────────────────────────────────────────────────
  const canNext = () => {
    if (step === 0) return form.name.trim().length >= 2 && form.category && form.placeType;
    if (step === 1) return form.countryCode.trim().length === 2 && form.city.trim().length >= 2;
    return true;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('Name', form.name.trim());
      if (form.description.trim()) data.append('Description', form.description.trim());
      data.append('Category', form.category);
      data.append('PlaceType', form.placeType);
      data.append('CountryCode', form.countryCode.trim().toUpperCase());
      data.append('City', form.city.trim());
      if (form.address.trim()) data.append('Address', form.address.trim());
      form.moods.forEach(m => data.append('Moods', m));
      form.images.forEach(img => data.append('Images', img));

      await api.post('/places', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(true);
    } catch (e) {
      const msg = e.response?.data?.message ?? e.response?.data?.error ?? 'Ошибка отправки';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(0);
    setSuccess(false);
    setError('');
    setForm({ name:'', description:'', category:'', placeType:'', countryCode:'', city:'', address:'', moods:[], images:[] });
    onClose();
  };

  const placeTypes = PLACE_TYPES_BY_CATEGORY[form.category] ?? [];

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className={styles.overlay} onClick={handleClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.successScreen}>
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.successTitle}>Спасибо!</h2>
            <p className={styles.successText}>
              Место отправлено на проверку модератору.<br />
              После одобрения оно появится на карте.
            </p>
            <button className={styles.successBtn} onClick={handleClose}>Закрыть</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>📍 Предложить место</h2>
          <button className={styles.closeBtn} onClick={handleClose}><CloseIcon /></button>
        </div>

        {/* Stepper */}
        <div className={styles.stepper}>
          {STEPS.map((label, i) => (
            <div key={i} className={`${styles.stepItem} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
              <div className={styles.stepDot}>{i < step ? '✓' : i + 1}</div>
              <span className={styles.stepLabel}>{label}</span>
              {i < STEPS.length - 1 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className={styles.content}>

          {/* ── Step 0: Основное ── */}
          {step === 0 && (
            <div className={styles.fields}>
              <div className={styles.field}>
                <label className={styles.label}>Название *</label>
                <input
                  className={styles.input}
                  placeholder="Например: Кафе У Моря"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  maxLength={150}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Описание</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Расскажите об этом месте..."
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={3}
                  maxLength={1000}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Категория *</label>
                <div className={styles.categoryGrid}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      className={`${styles.categoryBtn} ${form.category === cat.value ? styles.categoryActive : ''}`}
                      onClick={() => { set('category', cat.value); set('placeType', ''); }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {form.category && (
                <div className={styles.field}>
                  <label className={styles.label}>Тип места *</label>
                  <div className={styles.typeGrid}>
                    {placeTypes.map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        className={`${styles.typeBtn} ${form.placeType === val ? styles.typeActive : ''}`}
                        onClick={() => set('placeType', val)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 1: Локация ── */}
          {step === 1 && (
            <div className={styles.fields}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Код страны * <span className={styles.hint}>RU, TR, DE...</span></label>
                  <input
                    className={styles.input}
                    placeholder="RU"
                    value={form.countryCode}
                    onChange={e => set('countryCode', e.target.value.toUpperCase().slice(0, 2))}
                    maxLength={2}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Город *</label>
                  <input
                    className={styles.input}
                    placeholder="Москва"
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                    maxLength={100}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Адрес</label>
                <input
                  className={styles.input}
                  placeholder="ул. Пушкина, 10"
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  maxLength={200}
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Настроение ── */}
          {step === 2 && (
            <div className={styles.fields}>
              <p className={styles.moodHint}>Выберите настроения для этого места (необязательно)</p>
              <div className={styles.moodGrid}>
                {MOODS.map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    className={`${styles.moodBtn} ${form.moods.includes(val) ? styles.moodActive : ''}`}
                    onClick={() => toggleMood(val)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 3: Фото ── */}
          {step === 3 && (
            <div className={styles.fields}>
              <p className={styles.moodHint}>Добавьте до 5 фотографий (необязательно)</p>

              <input
                type="file"
                accept="image/*"
                multiple
                id="place-images"
                className={styles.fileInput}
                onChange={handleImages}
              />
              <label htmlFor="place-images" className={styles.dropzone}>
                <UploadIcon />
                <span>Выбрать фотографии</span>
                <span className={styles.dropzoneHint}>JPG, PNG, WEBP · до 5 МБ каждое</span>
              </label>

              {form.images.length > 0 && (
                <div className={styles.imagePreviewGrid}>
                  {form.images.map((file, i) => (
                    <div key={i} className={styles.imagePreviewItem}>
                      <img src={URL.createObjectURL(file)} alt="" className={styles.imagePreview} />
                      <button className={styles.imageRemove} onClick={() => removeImage(i)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && <p className={styles.error}><AlertIcon /> {error}</p>}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {step > 0 && (
            <button className={styles.backBtn} onClick={() => setStep(s => s - 1)} disabled={isLoading}>
              ← Назад
            </button>
          )}
          <div className={styles.footerRight}>
            {step < STEPS.length - 1 ? (
              <button
                className={styles.nextBtn}
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
              >
                Далее →
              </button>
            ) : (
              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Отправка...' : '📍 Предложить место'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function CloseIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function UploadIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
}
function AlertIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}