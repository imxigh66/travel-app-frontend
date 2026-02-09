import { useState } from 'react';
import { postApi } from '../api/createPost';
import Button from '../../../shared/ui/Button';
import styles from './CreatePostModal.module.css';

export const CreatePostModal = ({ isOpen, onClose, onSuccess, currentUser }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + images.length > 10) {
      setError('Максимум 10 изображений');
      return;
    }

    setImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Контент обязателен');
      return;
    }

    setIsLoading(true);

    try {
      const postData = {
        title: title.trim() || undefined,
        content: content.trim(),
        images: images.length > 0 ? images : undefined,
      };

      await postApi.createPost(postData);
      
      setTitle('');
      setContent('');
      setImages([]);
      setImagePreviews([]);
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка создания поста');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Создать пост</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <XIcon />
          </button>
        </div>

        {/* User Info */}
        <div className={styles.userInfo}>
          {currentUser?.profilePicture ? (
            <img 
              src={currentUser.profilePicture} 
              alt={currentUser.name} 
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarFallback}>{userInitials}</div>
          )}
          <div>
            <p className={styles.userName}>{currentUser?.name || 'Пользователь'}</p>
            <p className={styles.privacy}>
              <span className={styles.privacyIcon}>🌍</span>
              Все могут ответить
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {/* Content */}
          <textarea
            placeholder="Что у вас нового?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={5000}
            className={styles.textarea}
            autoFocus
          />

          {/* Title (optional) */}
          {title !== '' && (
            <input
              type="text"
              placeholder="Добавить заголовок (необязательно)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className={styles.titleInput}
            />
          )}

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className={styles.imageGrid}>
              {imagePreviews.map((preview, index) => (
                <div key={index} className={styles.imagePreview}>
                  <img src={preview} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className={styles.removeImageBtn}
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className={styles.divider} />

          {/* Actions Row */}
          <div className={styles.actions}>
            <div className={styles.actionsLeft}>
              {/* Add Images */}
              <label className={styles.actionBtn} title="Добавить фото">
                <ImageIcon />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className={styles.fileInput}
                  disabled={images.length >= 10}
                />
              </label>

              {/* Add Title */}
              {title === '' && (
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => setTitle(' ')}
                  title="Добавить заголовок"
                >
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>T</span>
                </button>
              )}

              {/* Emoji */}
              <button type="button" className={styles.actionBtn} title="Добавить эмодзи">
                <SmileIcon />
              </button>

              {/* Location */}
              <button type="button" className={styles.actionBtn} title="Добавить место">
                <MapPinIcon />
              </button>
            </div>

            {/* Submit Button */}
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading || !content.trim()}
              size="medium"
            >
              {isLoading ? 'Публикация...' : 'Опубликовать'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Icons Components
function XIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ImageIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function SmileIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

function MapPinIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}