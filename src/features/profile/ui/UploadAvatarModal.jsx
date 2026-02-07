import { useState, useRef } from 'react';
import { uploadProfilePicture } from '../api/userApi';
import styles from './UploadAvatarModal.module.css';

export default function UploadAvatarModal({ isOpen, onClose, onSuccess, currentAvatar }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(currentAvatar || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Валидация
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Неверный формат. Разрешены: JPG, PNG, WEBP');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      setError('Файл слишком большой. Максимум 5 МБ');
      return;
    }

    setError('');
    setSelectedFile(file);

    // Показываем превью
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Выберите файл');
      return;
    }

    setUploading(true);
    setError('');

    const result = await uploadProfilePicture(selectedFile);

    if (result.success && result.data) {
      onSuccess(result.data.fileUrl);
      handleClose();
    } else {
      setError(result.error || 'Ошибка загрузки');
    }

    setUploading(false);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(currentAvatar || null);
    setError('');
    onClose();
  };

  const handleRemovePreview = () => {
    setSelectedFile(null);
    setPreview(currentAvatar || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Загрузка фото профиля</h2>
          <button className={styles.closeBtn} onClick={handleClose}>
            <CloseIcon />
          </button>
        </div>

        <div className={styles.content}>
          {/* Превью */}
          <div className={styles.previewSection}>
            {preview ? (
              <div className={styles.previewWrapper}>
                <img src={preview} alt="Preview" className={styles.preview} />
                {selectedFile && (
                  <button 
                    className={styles.removePreviewBtn}
                    onClick={handleRemovePreview}
                    type="button"
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.placeholderPreview}>
                <ImageIcon />
                <p>Выберите изображение</p>
              </div>
            )}
          </div>

          {/* Информация */}
          <div className={styles.info}>
            <p className={styles.infoText}>
              📸 Рекомендуемый размер: 400×400 пикселей
            </p>
            <p className={styles.infoText}>
              📁 Форматы: JPG, PNG, WEBP
            </p>
            <p className={styles.infoText}>
              📏 Максимальный размер: 5 МБ
            </p>
          </div>

          {/* Выбор файла */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className={styles.fileInput}
            id="avatar-upload"
          />
          <label htmlFor="avatar-upload" className={styles.selectBtn}>
            <UploadIcon />
            {selectedFile ? 'Выбрать другое фото' : 'Выбрать фото'}
          </label>

          {/* Ошибка */}
          {error && (
            <div className={styles.error}>
              <WarningIcon />
              {error}
            </div>
          )}

          {/* Информация о файле */}
          {selectedFile && (
            <div className={styles.fileInfo}>
              <FileIcon />
              <div>
                <p className={styles.fileName}>{selectedFile.name}</p>
                <p className={styles.fileSize}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} МБ
                </p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button 
            className={styles.cancelBtn}
            onClick={handleClose}
            disabled={uploading}
          >
            Отмена
          </button>
          <button 
            className={styles.uploadBtn}
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <Spinner />
                Загрузка...
              </>
            ) : (
              <>
                <CheckIcon />
                Сохранить
              </>
            )}
          </button>
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

function Spinner() {
  return (
    <svg className={styles.spinner} width="18" height="18" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="60" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}