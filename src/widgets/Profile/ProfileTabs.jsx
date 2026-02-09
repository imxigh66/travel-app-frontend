import { useState, useEffect } from 'react';
import { CreatePostModal } from '../../features/post/ui/CreatePostModal';
import { PostCard } from '../../entities/post/ui/PostCard';
import { postApi } from '../../entities/post/api/postApi';

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
    { id: 'posts', label: 'Posts' },
    { id: 'photos', label: 'Photo' },
    { id: 'travel', label: 'Travel' },
  ];

  const allPhotos = posts.flatMap(p => p.imageUrls || []);

  return (
    <div className={styles.wrapper}>
      {/* Tabs Navigation */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        {activeTab === 'posts' && (
          <>
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

        {activeTab === 'travel' && (
          <div className={styles.empty}>
            <EmptyIcon />
            <p className={styles.emptyTitle}>Путешествия</p>
            <p className={styles.emptyText}>
              Здесь будут отображаться ваши путешествия
            </p>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchMyPosts}
        currentUser={currentUser}
      />

      {/* Floating Create Button */}
      <button 
        className={styles.floatingBtn}
        onClick={() => setIsCreateModalOpen(true)}
        title="Создать пост"
      >
        <PlusIcon size={24} />
      </button>
    </div>
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