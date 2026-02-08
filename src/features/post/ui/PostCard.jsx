import React, { useState } from 'react';
import { postApi } from '../api/postApi';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from './PostCard.module.css';

export const PostCard = ({ post, onLikeChange }) => {
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleLike = async () => {
    try {
      if (isLiked) {
        const result = await postApi.unlikePost(post.postId);
        setLikesCount(result.likesCount);
        setIsLiked(false);
      } else {
        const result = await postApi.likePost(post.postId);
        setLikesCount(result.likesCount);
        setIsLiked(true);
      }
      if (onLikeChange) {
        onLikeChange(post.postId, likesCount);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const nextImage = () => {
    if (post.imageUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % post.imageUrls.length);
    }
  };

  const prevImage = () => {
    if (post.imageUrls.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + post.imageUrls.length) % post.imageUrls.length
      );
    }
  };

  const userInitials = post.username
  ? post.username
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  : '?';


  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
  {post.userProfilePicture ? (
    <img
      src={post.userProfilePicture}
      alt={post.username}
      className={styles.avatar}
    />
  ) : (
    <div className={styles.avatarFallback}>{userInitials}</div>
  )}

  <div className={styles.userInfo}>
    <p className={styles.userName}>{post.username}</p>
    <p className={styles.timestamp}>
      {formatDistanceToNow(new Date(post.createdAt), {
        addSuffix: true,
        locale: ru,
      })}
    </p>
  </div>
</div>


      {/* Images */}
      {post.imageUrls.length > 0 && (
        <div className={styles.imageCarousel}>
          <img
            src={post.imageUrls[currentImageIndex]}
            alt="Post"
            className={styles.carouselImage}
          />

          {/* Navigation */}
          {post.imageUrls.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className={`${styles.carouselBtn} ${styles.carouselBtnPrev}`}
              >
                ←
              </button>
              <button
                onClick={nextImage}
                className={`${styles.carouselBtn} ${styles.carouselBtnNext}`}
              >
                →
              </button>

              {/* Dots */}
              <div className={styles.dots}>
                {post.imageUrls.map((_, index) => (
                  <div
                    key={index}
                    className={`${styles.dot} ${
                      index === currentImageIndex ? styles.dotActive : ''
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Content & Actions */}
      <div className={styles.content}>
        <div className={styles.actions}>
          <button
            onClick={handleLike}
            className={`${styles.actionBtn} ${isLiked ? styles.actionBtnLiked : ''}`}
          >
            <HeartIcon size={24} fill={isLiked} />
            <span>{likesCount}</span>
          </button>

          <button className={styles.actionBtn}>
            <MessageIcon size={24} />
          </button>

          <button className={`${styles.actionBtn} ${styles.actionBtnBookmark}`}>
            <BookmarkIcon size={24} />
          </button>
        </div>

        {/* Post Content */}
        {post.title && (
          <h3 className={styles.postTitle}>{post.title}</h3>
        )}
        <p className={styles.postContent}>{post.content}</p>
      </div>
    </div>
  );
};

// Icons
function HeartIcon({ size, fill }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function MessageIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BookmarkIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}