import { useState } from 'react';
import api from '../../../shared/api/axios';
import styles from './SuggestPlaceModal.module.css';

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
  ['WithCompany','👫 С компанией'],['Solo','🧘 Один'],['WithFamily','👨‍👩‍👧 С семьёй'],
  ['RomanticDate','💑 Вдвоём'],['Special','🔥 Особенное'],['Calm','😌 Тихо'],
  ['Active','⚡ Активно'],['Cultural','🏛️ Культурно'],['Foodie','🍽️ Поесть'],
  ['NightOut','🌙 Вечер'],['Nature','🌿 Природа'],
];

// Поля AdditionalInfo по категории
const ADDITIONAL_FIELDS = {
  Food: [
    { key: 'cuisine',       label: 'Кухня',          placeholder: 'Итальянская, грузинская…', type: 'text' },
    { key: 'priceRange',    label: 'Ценовой диапазон', placeholder: '$, $$, $$$',               type: 'text' },
    { key: 'openingHours',  label: 'Часы работы',    placeholder: '09:00–22:00',               type: 'text' },
    { key: 'phoneNumber',   label: 'Телефон',         placeholder: '+7 999 123-45-67',          type: 'text' },
    { key: 'website',       label: 'Сайт',            placeholder: 'https://…',                 type: 'text' },
    { key: 'hasDelivery',   label: 'Доставка',        type: 'bool' },
    { key: 'hasTakeaway',   label: 'Навынос',         type: 'bool' },
    { key: 'hasWifi',       label: 'Wi-Fi',           type: 'bool' },
  ],
  Accommodation: [
    { key: 'priceRange',    label: 'Цена за ночь',   placeholder: 'от 2000 ₽',  type: 'text' },
    { key: 'phoneNumber',   label: 'Телефон',         placeholder: '+7…',        type: 'text' },
    { key: 'website',       label: 'Сайт',            placeholder: 'https://…',  type: 'text' },
    { key: 'checkIn',       label: 'Заезд с',         placeholder: '14:00',      type: 'text' },
    { key: 'checkOut',      label: 'Выезд до',        placeholder: '12:00',      type: 'text' },
    { key: 'hasPool',       label: 'Бассейн',         type: 'bool' },
    { key: 'hasParking',    label: 'Парковка',        type: 'bool' },
    { key: 'hasBreakfast',  label: 'Завтрак',         type: 'bool' },
  ],
  Culture: [
    { key: 'openingHours',  label: 'Часы работы',    placeholder: '10:00–19:00', type: 'text' },
    { key: 'entryFee',      label: 'Стоимость входа',placeholder: 'Бесплатно / 500 ₽', type: 'text' },
    { key: 'phoneNumber',   label: 'Телефон',         placeholder: '+7…',         type: 'text' },
    { key: 'website',       label: 'Сайт',            placeholder: 'https://…',   type: 'text' },
    { key: 'hasGuidedTours',label: 'Экскурсии',       type: 'bool' },
    { key: 'hasAudioGuide', label: 'Аудиогид',        type: 'bool' },
    { key: 'accessibleForDisabled', label: 'Доступно для МГН', type: 'bool' },
  ],
  Nature: [
    { key: 'openingHours',  label: 'Часы работы',    placeholder: 'Круглосуточно', type: 'text' },
    { key: 'entryFee',      label: 'Вход',           placeholder: 'Бесплатно',     type: 'text' },
    { key: 'area',          label: 'Площадь',        placeholder: '120 га',        type: 'text' },
    { key: 'hasBikeRental', label: 'Прокат велосипедов', type: 'bool' },
    { key: 'hasCafe',       label: 'Кафе на территории', type: 'bool' },
    { key: 'petFriendly',   label: 'Можно с питомцем',   type: 'bool' },
  ],
  Entertainment: [
    { key: 'openingHours',   label: 'Часы работы',    placeholder: '12:00–24:00', type: 'text' },
    { key: 'pricePerPerson', label: 'Цена за человека', placeholder: '500 ₽',    type: 'text' },
    { key: 'phoneNumber',    label: 'Телефон',         placeholder: '+7…',        type: 'text' },
    { key: 'website',        label: 'Сайт',            placeholder: 'https://…',  type: 'text' },
    { key: 'ageRestriction', label: 'Возраст от (лет)', placeholder: '18',       type: 'number' },
  ],
  Shopping: [
    { key: 'openingHours',  label: 'Часы работы',    placeholder: '10:00–22:00', type: 'text' },
    { key: 'phoneNumber',   label: 'Телефон',         placeholder: '+7…',        type: 'text' },
    { key: 'website',       label: 'Сайт',            placeholder: 'https://…',  type: 'text' },
  ],
  Transport: [
    { key: 'openingHours',  label: 'Часы работы',    placeholder: 'Круглосуточно', type: 'text' },
    { key: 'phoneNumber',   label: 'Справочная',      placeholder: '+7…',           type: 'text' },
    { key: 'website',       label: 'Сайт',            placeholder: 'https://…',     type: 'text' },
  ],
  Services: [
    { key: 'openingHours',  label: 'Часы работы',    placeholder: '09:00–18:00', type: 'text' },
    { key: 'phoneNumber',   label: 'Телефон',         placeholder: '+7…',        type: 'text' },
    { key: 'website',       label: 'Сайт',            placeholder: 'https://…',  type: 'text' },
  ],
};

const STEPS = ['Основное', 'Локация', 'Детали', 'Настроение', 'Фото'];

export default function SuggestPlaceModal({ isOpen, onClose, isModerator = false }) {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', category: '', placeType: '',
    countryCode: '', city: '', address: '',
    latitude: '', longitude: '',
    moods: [], images: [],
    additionalInfo: {},
  });

  if (!isOpen) return null;

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const setAdditional = (key, value) =>
    setForm(f => ({ ...f, additionalInfo: { ...f.additionalInfo, [key]: value } }));

  const toggleMood = (mood) =>
    setForm(f => ({
      ...f,
      moods: f.moods.includes(mood) ? f.moods.filter(m => m !== mood) : [...f.moods, mood],
    }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length + form.images.length > 5) { setError('Максимум 5 фотографий'); return; }
    setError('');
    setForm(f => ({ ...f, images: [...f.images, ...files].slice(0, 5) }));
  };

  const removeImage = (idx) => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const canNext = () => {
    if (step === 0) return form.name.trim().length >= 2 && form.category && form.placeType;
    if (step === 1) return form.countryCode.trim().length === 2 && form.city.trim().length >= 2;
    return true;
  };

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
      if (form.address.trim())   data.append('Address', form.address.trim());
      if (form.latitude)         data.append('Latitude',  form.latitude);
      if (form.longitude)        data.append('Longitude', form.longitude);
      form.moods.forEach(m => data.append('Moods', m));
      form.images.forEach(img => data.append('Images', img));

      // AdditionalInfo — только непустые поля
      const addInfo = {};
      const fields = ADDITIONAL_FIELDS[form.category] ?? [];
      fields.forEach(f => {
        const val = form.additionalInfo[f.key];
        if (f.type === 'bool') {
          if (val === true || val === false) addInfo[f.key] = val;
        } else if (val !== undefined && String(val).trim() !== '') {
          addInfo[f.key] = f.type === 'number' ? Number(val) : String(val).trim();
        }
      });
      if (Object.keys(addInfo).length > 0) {
        data.append('AdditionalInfoJson', JSON.stringify(addInfo));
      }

      await api.post('/places', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
    } catch (e) {
      setError(e.response?.data?.message ?? e.response?.data?.error ?? 'Ошибка отправки');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(0); setSuccess(false); setError('');
    setForm({ name:'', description:'', category:'', placeType:'', countryCode:'', city:'', address:'', latitude:'', longitude:'', moods:[], images:[], additionalInfo:{} });
    onClose();
  };

  const placeTypes = PLACE_TYPES_BY_CATEGORY[form.category] ?? [];
  const additionalFields = ADDITIONAL_FIELDS[form.category] ?? [];
  const textFields = additionalFields.filter(f => f.type !== 'bool');
  const boolFields  = additionalFields.filter(f => f.type === 'bool');

  if (success) {
    return (
      <div className={styles.overlay} onClick={handleClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.successScreen}>
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.successTitle}>
              {isModerator ? 'Место создано!' : 'Спасибо!'}
            </h2>
            <p className={styles.successText}>
              {isModerator
                ? 'Место опубликовано и доступно в каталоге.'
                : 'Место отправлено на проверку модератору.\nПосле одобрения оно появится на карте.'
              }
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
          <h2 className={styles.title}>
            {isModerator ? '📍 Создать место' : '📍 Предложить место'}
          </h2>
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
                <input className={styles.input} placeholder="Например: Кафе У Моря" value={form.name} onChange={e => set('name', e.target.value)} maxLength={150} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Описание</label>
                <textarea className={styles.textarea} placeholder="Расскажите об этом месте..." value={form.description} onChange={e => set('description', e.target.value)} rows={3} maxLength={1000} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Категория *</label>
                <div className={styles.categoryGrid}>
                  {CATEGORIES.map(cat => (
                    <button key={cat.value} type="button" className={`${styles.categoryBtn} ${form.category === cat.value ? styles.categoryActive : ''}`}
                      onClick={() => { set('category', cat.value); set('placeType', ''); setForm(f => ({ ...f, additionalInfo: {} })); }}>
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
                      <button key={val} type="button" className={`${styles.typeBtn} ${form.placeType === val ? styles.typeActive : ''}`}
                        onClick={() => set('placeType', val)}>{label}</button>
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
                  <input className={styles.input} placeholder="RU" value={form.countryCode} onChange={e => set('countryCode', e.target.value.toUpperCase().slice(0, 2))} maxLength={2} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Город *</label>
                  <input className={styles.input} placeholder="Москва" value={form.city} onChange={e => set('city', e.target.value)} maxLength={100} />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Адрес</label>
                <input className={styles.input} placeholder="ул. Пушкина, 10" value={form.address} onChange={e => set('address', e.target.value)} maxLength={200} />
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Широта (Latitude)
                    <span className={styles.hint}> необязательно</span>
                  </label>
                  <input className={styles.input} placeholder="55.7558" type="number" step="any"
                    value={form.latitude} onChange={e => set('latitude', e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Долгота (Longitude)
                    <span className={styles.hint}> необязательно</span>
                  </label>
                  <input className={styles.input} placeholder="37.6176" type="number" step="any"
                    value={form.longitude} onChange={e => set('longitude', e.target.value)} />
                </div>
              </div>
              <p className={styles.coordsHint}>
                💡 Координаты можно найти в Google Maps: правый клик на место → «Что здесь?»
              </p>
            </div>
          )}

          {/* ── Step 2: Детали (AdditionalInfo) ── */}
          {step === 2 && (
            <div className={styles.fields}>
              {additionalFields.length === 0 ? (
                <p className={styles.moodHint}>Для этой категории дополнительных полей нет</p>
              ) : (
                <>
                  {textFields.map(f => (
                    <div key={f.key} className={styles.field}>
                      <label className={styles.label}>{f.label}</label>
                      <input
                        className={styles.input}
                        placeholder={f.placeholder ?? ''}
                        type={f.type === 'number' ? 'number' : 'text'}
                        value={form.additionalInfo[f.key] ?? ''}
                        onChange={e => setAdditional(f.key, e.target.value)}
                      />
                    </div>
                  ))}
                  {boolFields.length > 0 && (
                    <div className={styles.field}>
                      <label className={styles.label}>Особенности</label>
                      <div className={styles.boolGrid}>
                        {boolFields.map(f => {
                          const val = form.additionalInfo[f.key];
                          return (
                            <button
                              key={f.key}
                              type="button"
                              className={`${styles.boolBtn} ${val === true ? styles.boolBtnOn : val === false ? styles.boolBtnOff : ''}`}
                              onClick={() => {
                                if (val === undefined) setAdditional(f.key, true);
                                else if (val === true)  setAdditional(f.key, false);
                                else                    setAdditional(f.key, undefined);
                              }}
                            >
                              {val === true ? '✓' : val === false ? '✗' : '·'} {f.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Step 3: Настроение ── */}
          {step === 3 && (
            <div className={styles.fields}>
              <p className={styles.moodHint}>Выберите настроения для этого места (необязательно)</p>
              <div className={styles.moodGrid}>
                {MOODS.map(([val, label]) => (
                  <button key={val} type="button" className={`${styles.moodBtn} ${form.moods.includes(val) ? styles.moodActive : ''}`}
                    onClick={() => toggleMood(val)}>{label}</button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 4: Фото ── */}
          {step === 4 && (
            <div className={styles.fields}>
              <div className={styles.uploadArea}>
                <input type="file" id="place-photos" accept="image/*" multiple onChange={handleImages} className={styles.fileInput} />
                <label htmlFor="place-photos" className={styles.uploadLabel}>
                  <UploadIcon />
                  <span>Выберите фото (до 5)</span>
                  <span className={styles.uploadHint}>JPG, PNG, WEBP · до 8 МБ каждое</span>
                </label>
              </div>
              {form.images.length > 0 && (
                <div className={styles.previewGrid}>
                  {form.images.map((file, i) => (
                    <div key={i} className={styles.previewItem}>
                      <img src={URL.createObjectURL(file)} alt="" />
                      <button type="button" className={styles.removeImg} onClick={() => removeImage(i)}>✕</button>
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
            <button className={styles.backBtn} onClick={() => setStep(s => s - 1)}>← Назад</button>
          )}
          <div style={{ marginLeft: 'auto' }}>
            {step < STEPS.length - 1 ? (
              <button className={styles.nextBtn} onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
                Далее →
              </button>
            ) : (
              <button className={styles.submitBtn} onClick={handleSubmit} disabled={isLoading}>
                {isLoading
                  ? 'Сохранение...'
                  : isModerator ? '📍 Создать место' : '📍 Предложить место'
                }
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function CloseIcon()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }
function UploadIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> }
function AlertIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> }