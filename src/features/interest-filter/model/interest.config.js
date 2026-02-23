import { PlaceCategory } from '../../../entities/place'

export const INTERESTS = [
  { category: null,                    emoji: '🌍', label: 'Все' },
  { category: PlaceCategory.Food,      emoji: '🍜', label: 'Еда' },
  { category: PlaceCategory.Nature,    emoji: '🏔️', label: 'Природа' },
  { category: PlaceCategory.Culture,   emoji: '🏛️', label: 'Культура' },
  { category: PlaceCategory.Food,      emoji: '☕', label: 'Кафе' },  
  { category: PlaceCategory.Entertainment, emoji: '🎭', label: 'Развлечения' },
  { category: PlaceCategory.Nature,    emoji: '🏖️', label: 'Пляжи' },
  { category: PlaceCategory.Shopping,  emoji: '🛍️', label: 'Шопинг' },
  { category: PlaceCategory.Entertainment, emoji: '🌃', label: 'Ночная жизнь' },
]