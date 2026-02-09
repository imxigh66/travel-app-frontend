// features/profile/ui/UploadBannerModal.jsx
import { useState } from 'react';
import styles from './UploadBannerModal.module.css';

export default function UploadBannerModal({ isOpen, onClose, onSuccess, currentBanner }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentBanner || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }

    setError('');
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('banner', selectedFile);

      const response = await fetch('/api/profile/upload-banner', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки');
      }

      const data = await response.json();
      onSuccess(data.bannerUrl);
      handleClose();
    } catch (err) {
      setError(err.message || 'Произошла ошибка при загрузке');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(currentBanner || null);
    setError('');
    onClose();
  };

  const handleRemove = async () => {
    setIsUploading(true);
    try {
      const response = await fetch('/api/profile/remove-banner', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления');
      }

      onSuccess(null);
      handleClose();
    } catch (err) {
      setError(err.message || 'Произошла ошибка при удалении');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Изменить обложку</h2>
          <button className={styles.closeBtn} onClick={handleClose}>
            <CloseIcon />
          </button>
        </div>

        <div className={styles.content}>
          {/* Preview */}
          <div className={styles.preview}>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className={styles.previewImage} />
            ) : (
              <div className={styles.previewPlaceholder}>
                <ImageIcon />
                <span>Обложка не выбрана</span>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className={styles.error}>
              <AlertIcon />
              {error}
            </div>
          )}

          {/* File Input */}
          <label className={styles.fileInputLabel}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className={styles.fileInput}
              disabled={isUploading}
            />
            <UploadIcon />
            <span>Выбрать изображение</span>
          </label>

          <p className={styles.hint}>
            Рекомендуемый размер: 1500x500px. Максимальный размер: 5MB
          </p>
        </div>

        <div className={styles.footer}>
          {currentBanner && (
            <button
              className={styles.removeBtn}
              onClick={handleRemove}
              disabled={isUploading}
            >
              Удалить обложку
            </button>
          )}
          
          <div className={styles.actions}>
            <button
              className={styles.cancelBtn}
              onClick={handleClose}
              disabled={isUploading}
            >
              Отмена
            </button>
            <button
              className={styles.uploadBtn}
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Загрузка...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}