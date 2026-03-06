import { useState, useEffect, useRef } from 'react'
import { commentApi } from '../../entities/comment/api/commentApi'
import { CommentItem } from '../../entities/comment/ui/CommentItem'
import styles from './CommentSection.module.css'

export function CommentSection({ postId, currentUserId, onCountChange }) {
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const inputRef = useRef(null)

  // Загрузка комментариев при первом открытии
  useEffect(() => {
    loadComments(1, true)
    inputRef.current?.focus()
  }, [postId])

  const loadComments = async (pageNumber, reset = false) => {
    try {
      setIsLoading(true)
      const data = await commentApi.getComments(postId, pageNumber, 20)
      setComments(prev => reset ? data.items : [...prev, ...data.items])
      setHasMore(data.hasNextPage)
      setPage(pageNumber)
    } catch (err) {
      console.error('Failed to load comments', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || isSending) return

    setIsSending(true)
    try {
      const newComment = await commentApi.createComment(postId, trimmed)
      setComments(prev => [...prev, newComment])
      setText('')
      if (onCountChange) onCountChange(1) // +1 к счётчику в PostCard
    } catch (err) {
      console.error('Failed to post comment', err)
    } finally {
      setIsSending(false)
    }
  }

  const handleDelete = async (commentId) => {
    try {
      await commentApi.deleteComment(postId, commentId)
      setComments(prev => prev.filter(c => c.commentId !== commentId))
      if (onCountChange) onCountChange(-1) // -1 к счётчику
    } catch (err) {
      console.error('Failed to delete comment', err)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={styles.wrap}>
      {/* Список */}
      <div className={styles.list}>
        {isLoading && comments.length === 0 && (
          <div className={styles.loading}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        )}

        {!isLoading && comments.length === 0 && (
          <p className={styles.empty}>Будьте первым, кто оставит комментарий</p>
        )}

        {comments.map(comment => (
          <CommentItem
            key={comment.commentId}
            comment={comment}
            currentUserId={currentUserId}
            onDelete={handleDelete}
          />
        ))}

        {hasMore && !isLoading && (
          <button
            className={styles.loadMore}
            onClick={() => loadComments(page + 1)}
          >
            Показать ещё
          </button>
        )}
      </div>

      {/* Поле ввода */}
      <div className={styles.inputRow}>
        <textarea
          ref={inputRef}
          className={styles.input}
          placeholder="Написать комментарий..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={500}
        />
        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={!text.trim() || isSending}
        >
          {isSending
            ? <span className={styles.spinner} />
            : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )
          }
        </button>
      </div>
    </div>
  )
}