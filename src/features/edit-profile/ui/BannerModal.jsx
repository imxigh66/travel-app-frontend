import { useState, useRef } from 'react';
import api from '../../../shared/api/axios';
import styles from './BannerModal.module.css';
import { BANNER_PRESETS as PRESETS } from '../../../shared/constants/bannerPresets';




export default function BannerModal({ isOpen, onClose, onSuccess, currentBanner ,accountType}) {
  const [tab, setTab] = useState('presets'); // 'presets' | 'upload'
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Выберите изображение (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Файл слишком большой. Максимум 8 МБ');
      return;
    }

    setError('');
    setSelectedFile(file);
    setSelectedPreset(null);

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const { data } = await api.post('/users/banner', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        onSuccess(data.data?.fileUrl ?? null);
      } else if (selectedPreset) {
        // ← выбираем эндпоинт по типу аккаунта
        const endpoint = accountType === 1 ? '/users/business' : '/users/profile';
        await api.patch(endpoint, { bannerPreset: selectedPreset.id });
        onSuccess({ preset: selectedPreset.id, css: selectedPreset.css });
      }
      handleClose();
    } catch (e) {
      setError('Ошибка сохранения. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      await api.delete('/users/banner');
      onSuccess(null);
      handleClose();
    } catch (e) {
      setError('Ошибка удаления');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedPreset(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
    onClose();
  };

  const canSave = selectedPreset || selectedFile;

  // ── Текущий баннер для превью ────────────────────────────────────────────────
  const currentPreview = previewUrl
    ? { type: 'image', src: previewUrl }
    : selectedPreset
    ? { type: 'gradient', css: selectedPreset.css }
    : currentBanner?.preset
    ? { type: 'gradient', css: PRESETS.find(p => p.id === currentBanner.preset)?.css }
    : currentBanner
    ? { type: 'image', src: currentBanner }
    : null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Изменить обложку</h2>
          <button className={styles.closeBtn} onClick={handleClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Preview */}
        <div className={styles.preview}>
          {currentPreview?.type === 'image' && (
            <img src={currentPreview.src} alt="" className={styles.previewImg} />
          )}
          {currentPreview?.type === 'gradient' && (
            <div className={styles.previewGradient} style={{ background: currentPreview.css }} />
          )}
          {!currentPreview && (
            <div className={styles.previewEmpty}>
              <MountainIcon />
              <span>Нет обложки</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${tab === 'presets' ? styles.tabActive : ''}`}
            onClick={() => setTab('presets')}
          >
            🎨 Галерея
          </button>
          <button
            className={`${styles.tabBtn} ${tab === 'upload' ? styles.tabActive : ''}`}
            onClick={() => setTab('upload')}
          >
            📁 Загрузить фото
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>

          {/* ── Presets tab ── */}
          {tab === 'presets' && (
            <div className={styles.presetsGrid}>
              {PRESETS.map(preset => (
                <button
                  key={preset.id}
                  className={`${styles.presetItem} ${selectedPreset?.id === preset.id ? styles.presetSelected : ''}`}
                  onClick={() => handlePresetSelect(preset)}
                  title={preset.label}
                >
                  <div
                    className={styles.presetSwatch}
                    style={{ background: preset.css }}
                  />
                  <span className={styles.presetLabel}>{preset.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* ── Upload tab ── */}
          {tab === 'upload' && (
            <div className={styles.uploadArea}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className={styles.fileInput}
                id="banner-upload"
              />
              <label htmlFor="banner-upload" className={styles.dropzone}>
                <UploadIcon />
                <p className={styles.dropzoneTitle}>
                  {selectedFile ? selectedFile.name : 'Выберите или перетащите фото'}
                </p>
                <p className={styles.dropzoneHint}>JPG, PNG, WEBP · до 8 МБ · 1500×500px</p>
              </label>
            </div>
          )}

          {error && <p className={styles.error}><AlertIcon /> {error}</p>}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {currentBanner && (
            <button className={styles.removeBtn} onClick={handleRemove} disabled={isLoading}>
              Удалить обложку
            </button>
          )}
          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={handleClose} disabled={isLoading}>
              Отмена
            </button>
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={!canSave || isLoading}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function CloseIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function UploadIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
}
function AlertIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
function MountainIcon() {
  return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 20l7-10 4 5 3-3 4 8H3z"/></svg>;
}