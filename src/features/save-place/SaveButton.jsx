import Button from '../../shared/ui/Button'
import { useSavePlace } from './useSavePlace'
import styles from './SaveButton.module.css'

export default function SaveButton({ placeId, initialSaved = false, size = 'sm', className = '' }) {
  const { isSaved, loading, toggle } = useSavePlace(initialSaved, placeId)

  return (
    <Button
      size={size}
      isLoading={loading}
      leftIcon={<span className={`${styles.icon} ${isSaved ? styles.iconSaved : ''}`}>🔖</span>}
      className={`${styles.btn} ${isSaved ? styles.saved : styles.unsaved} ${className}`}
      onClick={toggle}
    >
      {isSaved ? 'Сохранено' : 'Сохранить'}
    </Button>
  )
}