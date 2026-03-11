
import { useState, useEffect } from 'react'
import { placeApi } from '../../entities/place/model/place.api'
import { PostCard } from '../../entities/post/ui/PostCard'
import styles from './PlacePosts.module.css'

export function PlacePosts({ placeId }) {
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchPosts = async (pageNum) => {
    setLoading(true)
    try {
      const res = await placeApi.getPosts(placeId, pageNum, 5)
      if (pageNum === 1) setPosts(res.items ?? [])
      else setPosts(prev => [...prev, ...(res.items ?? [])])
      setHasMore(res.hasNextPage ?? false)
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPosts(1) }, [placeId])

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
        ? Array.from({ length: 2 }).map((_, i) => <div key={i} className={styles.skeleton} />)
        : posts.map(post => <PostCard key={post.postId} post={post} />)
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