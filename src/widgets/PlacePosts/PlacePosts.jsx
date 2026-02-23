// widgets/PlacePosts/PlacePosts.jsx

import { useState, useEffect } from 'react'
import { placeApi } from '../../entities/place/model/place.api'
import styles from './PlacePosts.module.css'

// ── Импортируй свой PostCard ──
// import { PostCard } from '../../features/posts/ui/PostCard'

// Временный PostCard если нет своего
function PostCard({ post }) {
  const [liked, setLiked] = useState(false)

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} мин. назад`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} ч. назад`
    return `${Math.floor(hrs / 24)} дн. назад`
  }

  return (
    <div className={styles.postCard}>
      <div className={styles.postHeader}>
        <div className={styles.postUser}>
          <div className={styles.postAvatar}>
            {post.userProfilePicture
              ? <img src={post.userProfilePicture} alt={post.username}
                     onError={e => { e.target.style.display = 'none' }} />
              : post.username?.slice(0, 2).toUpperCase()
            }
          </div>
          <div>
            <div className={styles.postUsername}>{post.username}</div>
            <div className={styles.postMeta}>{timeAgo(post.createdAt)}</div>
          </div>
        </div>
        <button className={styles.postMore}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5"/>
            <circle cx="12" cy="12" r="1.5"/>
            <circle cx="12" cy="19" r="1.5"/>
          </svg>
        </button>
      </div>

      {post.title && <div className={styles.postTitle}>{post.title}</div>}
      <div className={styles.postContent}>{post.content}</div>

      {post.imageUrls?.length > 0 && (
        <div className={`${styles.postImages} ${post.imageUrls.length === 1 ? styles.oneImage : ''}`}>
          {post.imageUrls.slice(0, 2).map((url, i) => (
            <div key={i} className={styles.postImgWrap}>
              <img src={url} alt="" className={styles.postImg}
                   onError={e => e.target.parentElement.style.background = '#f3f4f6'} />
            </div>
          ))}
        </div>
      )}

      <div className={styles.postActions}>
        <button
          className={`${styles.postAction} ${liked ? styles.liked : ''}`}
          onClick={() => setLiked(v => !v)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24"
            fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          {liked ? post.likesCount + 1 : post.likesCount}
        </button>
        <button className={styles.postAction}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          0
        </button>
        <button className={styles.postAction}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          0
        </button>
        <button className={styles.postSaveBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export function PlacePosts({ placeId }) {
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchPosts = async (pageNum) => {
    setLoading(true)
    try {
      const res = await placeApi.getPosts(placeId, pageNum, 5)
      if (pageNum === 1) {
        setPosts(res.items ?? [])
      } else {
        setPosts(prev => [...prev, ...(res.items ?? [])])
      }
      setHasMore(res.hasNextPage ?? false)
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts(1)
  }, [placeId])

  const handleShowMore = () => {
    const next = page + 1
    setPage(next)
    fetchPosts(next)
  }

  if (!loading && posts.length === 0) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.title}>Посты</div>

      {loading && posts.length === 0
        ? Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))
        : posts.map(post => (
            <PostCard key={post.postId} post={post} />
          ))
      }

      {hasMore && !loading && (
        <button className={styles.moreBtn} onClick={handleShowMore}>
          Показать больше постов
        </button>
      )}

      {loading && posts.length > 0 && (
        <div className={styles.loadingMore}>
          <div className={styles.dot} />
          <div className={styles.dot} />
          <div className={styles.dot} />
        </div>
      )}
    </div>
  )
}