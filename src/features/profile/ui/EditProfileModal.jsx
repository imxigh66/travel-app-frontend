import { useState, useEffect } from 'react';
import Button from '../../../shared/ui/EditButton';
import Input from '../../../shared/ui/EditInput';
import Textarea from '../../../shared/ui/EditTextarea';
import Select from '../../../shared/ui//EditSelect';
import Modal from '../../../shared/ui/EditModal';
import { updatePersonalProfile, updateBusinessProfile } from '../../../features/profile/api/userApi';
import styles from './EditProfileModal.module.css';

const TRAVEL_INTERESTS = [
  { value: 0, label: 'Природа' },
  { value: 1, label: 'Еда' },
  { value: 2, label: 'Приключения' },
  { value: 3, label: 'Культура' },
  { value: 4, label: 'Городская жизнь' },
  { value: 5, label: 'Релакс' },
  { value: 6, label: 'Фотография' },
];

const TRAVEL_STYLES = [
  { value: 0, label: 'Гурман' },
  { value: 1, label: 'Культурный исследователь' },
  { value: 2, label: 'Цифровой кочевник' },
  { value: 3, label: 'Бэкпэкер' },
  { value: 4, label: 'Люкс путешественник' },
  { value: 5, label: 'Медленный путешественник' },
  { value: 6, label: 'Искатель приключений' },
];

const BUSINESS_TYPES = [
  { value: 0, label: 'Отель' },
  { value: 1, label: 'Ресторан' },
  { value: 2, label: 'Кафе' },
  { value: 3, label: 'Турагентство' },
  { value: 4, label: 'Туроператор' },
  { value: 5, label: 'Коворкинг' },
  { value: 6, label: 'Местный гид' },
  { value: 7, label: 'Провайдер впечатлений' },
];

export default function EditProfileModal({ user, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    country: '',
    city: '',
    bio: '',
    profilePicture: '',
    travelInterest: undefined,
    travelStyle: undefined,
    businessType: undefined,
    businessAddress: '',
    businessWebsite: '',
    businessPhone: '',
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isPersonal = user.accountType === 0;
  const isBusiness = user.accountType === 1;

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        username: user.username || '',
        name: user.name || '',
        country: user.country || '',
        city: user.city || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || '',
        travelInterest: user.travelInterest,
        travelStyle: user.travelStyle,
        businessType: user.businessType,
        businessAddress: user.businessAddress || '',
        businessWebsite: user.businessWebsite || '',
        businessPhone: user.businessPhone || '',
      });
      setError(null);
    }
  }, [isOpen, user]);

  const handleFileUpload = async (file, uploadError) => {
    if (uploadError) {
      setError(uploadError);
      return;
    }

    if (!file) {
      setFormData(prev => ({ ...prev, profilePicture: '' }));
      return;
    }

    setUploading(true);
    setError(null);

    const result = await uploadProfilePicture(file);
    
    if (result.success && result.url) {
      setFormData(prev => ({ ...prev, profilePicture: result.url }));
    } else {
      setError(result.error || 'Ошибка загрузки файла');
    }
    
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Подготовка данных - отправляем только измененные поля
      const prepareData = () => {
        const data = {};
        
        // Общие поля
        if (formData.username !== user.username) {
          data.username = formData.username;
        }
        if (formData.name !== user.name) {
          data.name = formData.name;
        }
        if (formData.country !== (user.country || '')) {
          data.country = formData.country || null;
        }
        if (formData.city !== (user.city || '')) {
          data.city = formData.city || null;
        }
        if (formData.bio !== (user.bio || '')) {
          data.bio = formData.bio || null;
        }
        if (formData.profilePicture !== (user.profilePicture || '')) {
          data.profilePicture = formData.profilePicture || null;
        }

        // Personal fields
        if (isPersonal) {
          if (formData.travelInterest !== user.travelInterest) {
            data.travelInterest = formData.travelInterest;
          }
          if (formData.travelStyle !== user.travelStyle) {
            data.travelStyle = formData.travelStyle;
          }
        }

        // Business fields
        if (isBusiness) {
          if (formData.businessType !== user.businessType) {
            data.businessType = formData.businessType;
          }
          if (formData.businessAddress !== (user.businessAddress || '')) {
            data.businessAddress = formData.businessAddress || null;
          }
          if (formData.businessWebsite !== (user.businessWebsite || '')) {
            data.businessWebsite = formData.businessWebsite || null;
          }
          if (formData.businessPhone !== (user.businessPhone || '')) {
            data.businessPhone = formData.businessPhone || null;
          }
        }

        return data;
      };

      const updateData = prepareData();

      // Если нет изменений
      if (Object.keys(updateData).length === 0) {
        onClose();
        return;
      }

      // Отправка данных
      const result = isPersonal
        ? await updatePersonalProfile(updateData)
        : await updateBusinessProfile(updateData);

      if (result.success && result.data) {
        onSuccess(result.data);
        onClose();
      } else {
        setError(result.error || 'Ошибка обновления профиля');
      }
    } catch (err) {
      setError('Произошла ошибка');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Редактировать профиль"
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.errorAlert}>
            <ErrorIcon />
            <span>{error}</span>
          </div>
        )}

        {/* Фото профиля 
        <div className={styles.section}>
          <FileUpload
            label="Фото профиля"
            value={formData.profilePicture}
            onChange={handleFileUpload}
            isLoading={uploading}
            accept="image/*"
            maxSize={5 * 1024 * 1024}
          />
        </div>*/}

        {/* Основные поля */}
        <div className={styles.section}>
          <Input
            label="Имя пользователя"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            required
            minLength={3}
            maxLength={50}
            fullWidth
            placeholder="username"
          />

          <Input
            label="Полное имя"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            maxLength={100}
            fullWidth
            placeholder="Ваше имя"
          />

          <div className={styles.row}>
            <Input
              label="Страна"
              value={formData.country}
              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              maxLength={100}
              fullWidth
              placeholder="Moldova"
            />

            <Input
              label="Город"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              maxLength={100}
              fullWidth
              placeholder="Chisinau"
            />
          </div>

          <Textarea
            label="О себе"
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            maxLength={500}
            showCount
            fullWidth
            placeholder="Расскажите о себе..."
          />
        </div>

        {/* Personal fields */}
        {isPersonal && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Предпочтения в путешествиях</h3>
            
            <Select
              label="Интересы"
              value={formData.travelInterest ?? ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                travelInterest: e.target.value ? Number(e.target.value) : undefined 
              }))}
              options={TRAVEL_INTERESTS}
              placeholder="Выберите интересы"
              fullWidth
            />

            <Select
              label="Стиль путешествий"
              value={formData.travelStyle ?? ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                travelStyle: e.target.value ? Number(e.target.value) : undefined 
              }))}
              options={TRAVEL_STYLES}
              placeholder="Выберите стиль"
              fullWidth
            />
          </div>
        )}

        {/* Business fields */}
        {isBusiness && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Информация о бизнесе</h3>
            
            <Select
              label="Тип бизнеса"
              value={formData.businessType ?? ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                businessType: e.target.value ? Number(e.target.value) : undefined 
              }))}
              options={BUSINESS_TYPES}
              placeholder="Выберите тип"
              fullWidth
            />

            <Input
              label="Адрес"
              value={formData.businessAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, businessAddress: e.target.value }))}
              maxLength={255}
              fullWidth
              placeholder="ул. Примерная, 123"
            />

            <Input
              label="Веб-сайт"
              type="url"
              value={formData.businessWebsite}
              onChange={(e) => setFormData(prev => ({ ...prev, businessWebsite: e.target.value }))}
              maxLength={255}
              fullWidth
              placeholder="https://example.com"
            />

            <Input
              label="Телефон"
              type="tel"
              value={formData.businessPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, businessPhone: e.target.value }))}
              maxLength={30}
              fullWidth
              placeholder="+373 60 123 456"
            />
          </div>
        )}

        {/* Действия */}
        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading || uploading}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading || uploading}
            disabled={uploading}
          >
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ErrorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}