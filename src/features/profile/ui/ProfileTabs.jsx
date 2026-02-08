import { useState, useEffect } from 'react';
import { CreatePostModal } from '../../../features/post/ui/CreatePostModal';
import { PostCard } from '../../../features/post/ui/PostCard';
import { postApi } from '../../../features/post/api/postApi';
import Button from '../../../shared/ui/PublishButton';
import styles from './ProfileTabs.module.css';

export default function ProfileTabs({ currentUser }) {
  const [activeTab, setActiveTab] = useState('posts');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMyPosts = async () => {
    setIsLoading(true);
    try {
      const response = await postApi.getMyPosts(1, 20);
      setPosts(response.items);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchMyPosts();
    }
  }, [activeTab]);

  const tabs = [
    { id: 'posts', label: 'Посты', icon: <PostIcon /> },
    { id: 'photos', label: 'Фото', icon: <PhotoIcon /> },
  ];

  const allPhotos = posts.flatMap(p => p.imageUrls || []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'posts' && (
          <>
            {/* Create Post Button */}
            <div className={styles.createButtonWrapper}>
              <Button
                variant="primary"
                size="large"
                fullWidth
                 icon={<PlusIcon />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Создать пост
              </Button>
            </div>

            {/* Posts List */}
            {isLoading ? (
              <div className={styles.loading}>
                <LoadingSpinner />
                <p>Загрузка постов...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className={styles.empty}>
                <EmptyIcon />
                <p className={styles.emptyTitle}>Постов пока нет</p>
                <p className={styles.emptyText}>
                  Поделитесь своими впечатлениями о путешествиях
                </p>
              </div>
            ) : (
              <div className={styles.postsList}>
                {posts.map((post) => (
                  <PostCard 
                    key={post.postId} 
                    post={post} 
                    user={currentUser}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'photos' && (
          <>
            {allPhotos.length === 0 ? (
              <div className={styles.empty}>
                <EmptyIcon />
                <p className={styles.emptyTitle}>Фото пока нет</p>
                <p className={styles.emptyText}>
                  Загрузите фото из ваших поездок
                </p>
              </div>
            ) : (
              <div className={styles.photoGrid}>
                {allPhotos.map((url, idx) => (
                  <div key={idx} className={styles.photoItem}>
                    <img src={url} alt="" className={styles.photo} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchMyPosts}
        currentUser={currentUser}
      />
    </div>
  );
}

function PostIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function PhotoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#cbd5e1' }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
    </svg>
  );
}

function PlusIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg 
      width="32" 
      height="32" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      className={styles.spinner}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}