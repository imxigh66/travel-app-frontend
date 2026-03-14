import { useState, useRef, useEffect, useCallback } from 'react';
import { postApi } from '../../../entities/post/api/postApi';
import { placeApi } from '../../../entities/place/index';
import styles from './CreatePostCard.module.css';

export function CreatePostCard({ currentUser, onSuccess }) {
  const [content, setContent]         = useState('');
  const [title, setTitle]             = useState('');
  const [showTitle, setShowTitle]     = useState(false);
  const [images, setImages]           = useState([]);
  const [previews, setPreviews]       = useState([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState('');
  const [focused, setFocused]         = useState(false);

  // Place search
  const [placeQuery, setPlaceQuery]   = useState('');
  const [placeResults, setPlaceResults] = useState([]);
  const [placeSearching, setPlaceSearching] = useState(false);
  const [selectedPlace, setSelectedPlace]   = useState(null);
  const [showPlaceSearch, setShowPlaceSearch] = useState(false);

  const fileInputRef  = useRef(null);
  const placeTimer    = useRef(null);
  const placeRef      = useRef(null);
  const textareaRef   = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  // Close place dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (placeRef.current && !placeRef.current.contains(e.target)) {
        setShowPlaceSearch(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced place search
  const searchPlaces = useCallback((q) => {
    clearTimeout(placeTimer.current);
    if (!q.trim()) { setPlaceResults([]); return; }
    placeTimer.current = setTimeout(async () => {
      setPlaceSearching(true);
      try {
        const res = await placeApi.getAll({ search: q, pageNumber: 1, pageSize: 6 });
        setPlaceResults(res.items ?? []);
      } catch {
        setPlaceResults([]);
      } finally {
        setPlaceSearching(false);
      }
    }, 350);
  }, []);

  const handlePlaceQueryChange = (e) => {
    const val = e.target.value;
    setPlaceQuery(val);
    searchPlaces(val);
  };

  const selectPlace = (place) => {
    setSelectedPlace(place);
    setPlaceQuery('');
    setPlaceResults([]);
    setShowPlaceSearch(false);
  };

  const removePlace = () => {
    setSelectedPlace(null);
    setPlaceQuery('');
  };

  // Images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      setError('Максимум 10 изображений');
      return;
    }
    setImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  // Submit
  const handleSubmit = async () => {
    if (!content.trim()) return;
    setError('');
    setIsLoading(true);
    try {
      await postApi.createPost({
        title: title.trim() || undefined,
        content: content.trim(),
        images: images.length > 0 ? images : undefined,
        placeId: selectedPlace?.placeId ?? undefined,
      });
      setContent('');
      setTitle('');
      setShowTitle(false);
      setImages([]);
      setPreviews([]);
      setSelectedPlace(null);
      setFocused(false);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка публикации');
    } finally {
      setIsLoading(false);
    }
  };

  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : currentUser?.username?.slice(0, 2).toUpperCase() ?? '?';

  const canPost = content.trim().length > 0;

  return (
    <div className={`${styles.card} ${focused ? styles.cardFocused : ''}`}>
      {/* ── Top row ── */}
      <div className={styles.topRow}>
        {/* Avatar */}
        <div className={styles.avatarWrap}>
          {currentUser?.profilePicture
            ? <img src={currentUser.profilePicture} alt="" className={styles.avatar} />
            : <div className={styles.avatarFallback}>{userInitials}</div>
          }
        </div>

        {/* Textarea */}
        <div className={styles.textWrap}>
          {showTitle && (
            <input
              className={styles.titleInput}
              placeholder="Заголовок (необязательно)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
            />
          )}
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder="Что нового?"
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            maxLength={5000}
            rows={focused ? 3 : 1}
          />
        </div>
      </div>

      {/* ── Expanded area ── */}
      {focused && (
        <>
          {/* Image previews */}
          {previews.length > 0 && (
            <div className={styles.previewGrid}>
              {previews.map((src, i) => (
                <div key={i} className={styles.previewItem}>
                  <img src={src} alt="" />
                  <button className={styles.removeImg} onClick={() => removeImage(i)} type="button">
                    <XSmallIcon />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tagged place pill */}
          {selectedPlace && (
            <div className={styles.taggedPlace}>
              <PinIcon />
              <span className={styles.taggedPlaceName}>{selectedPlace.name}</span>
              <span className={styles.taggedPlaceCity}>{selectedPlace.city}</span>
              <button className={styles.removeTagBtn} onClick={removePlace} type="button">
                <XSmallIcon />
              </button>
            </div>
          )}

          {/* Place search dropdown */}
          {showPlaceSearch && (
            <div className={styles.placeSearchWrap} ref={placeRef}>
              <div className={styles.placeSearchInputWrap}>
                <SearchIcon />
                <input
                  className={styles.placeSearchInput}
                  placeholder="Поиск мест..."
                  value={placeQuery}
                  onChange={handlePlaceQueryChange}
                  autoFocus
                />
                {placeSearching && <SpinnerIcon />}
              </div>

              {placeResults.length > 0 && (
                <div className={styles.placeDropdown}>
                  {placeResults.map(place => (
                    <button
                      key={place.placeId}
                      className={styles.placeOption}
                      onClick={() => selectPlace(place)}
                      type="button"
                    >
                      <div className={styles.placeOptionThumb}>
                        {place.coverImageUrl
                          ? <img src={place.coverImageUrl} alt="" />
                          : <span>📍</span>
                        }
                      </div>
                      <div className={styles.placeOptionInfo}>
                        <span className={styles.placeOptionName}>{place.name}</span>
                        <span className={styles.placeOptionCity}>{place.city}, {place.countryCode}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {placeQuery && !placeSearching && placeResults.length === 0 && (
                <div className={styles.placeEmpty}>Места не найдены</div>
              )}
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          {/* ── Bottom toolbar ── */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              {/* Photo */}
              <label className={styles.toolBtn} title="Добавить фото">
                <ImageIcon />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className={styles.hiddenInput}
                  disabled={images.length >= 10}
                />
              </label>

              {/* Title toggle */}
              <button
                type="button"
                className={`${styles.toolBtn} ${showTitle ? styles.toolBtnActive : ''}`}
                onClick={() => setShowTitle(v => !v)}
                title="Добавить заголовок"
              >
                <TitleIcon />
              </button>

              {/* Tag place */}
              <button
                type="button"
                className={`${styles.toolBtn} ${(selectedPlace || showPlaceSearch) ? styles.toolBtnActive : ''}`}
                onClick={() => {
                  if (selectedPlace) { removePlace(); return; }
                  setShowPlaceSearch(v => !v);
                }}
                title="Отметить место"
              >
                <PinIcon />
              </button>
            </div>

            <div className={styles.toolbarRight}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => {
                  setFocused(false);
                  setShowPlaceSearch(false);
                }}
              >
                Отмена
              </button>
              <button
                type="button"
                className={styles.submitBtn}
                disabled={!canPost || isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? 'Публикую...' : 'Опубликовать'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────
function XSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}
function TitleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="14" y2="12"/>
      <line x1="4" y1="17" x2="18" y2="17"/>
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}