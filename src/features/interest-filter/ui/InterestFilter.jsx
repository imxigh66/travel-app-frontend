import { useState } from 'react'
import { INTERESTS } from '../model/interest.config'
import { InterestChip } from './InterestChip'
import styles from './InterestFilter.module.css'

export function InterestFilter({ onChange }) {
  const [active, setActive] = useState(0) // индекс — 0 = "Все"

  const handleClick = (index, category) => {
    setActive(index)
    onChange?.(category) // null = все категории
  }

  return (
    <div className={styles.wrap}>
      {INTERESTS.map((item, index) => (
        <InterestChip
          key={index}
          emoji={item.emoji}
          label={item.label}
          active={active === index}
          onClick={() => handleClick(index, item.category)}
        />
      ))}
    </div>
  )
}