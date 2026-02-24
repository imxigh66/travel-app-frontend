
import { MoodType, PlaceCategory, PlaceType } from './place.types'

export const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  [PlaceCategory.Food]:          '🍜 Еда',
  [PlaceCategory.Accommodation]: '🏨 Жильё',
  [PlaceCategory.Culture]:       '🏛️ Культура',
  [PlaceCategory.Nature]:        '🌿 Природа',
  [PlaceCategory.Entertainment]: '🎭 Развлечения',
  [PlaceCategory.Shopping]:      '🛍️ Шопинг',
  [PlaceCategory.Transport]:     '🚉 Транспорт',
  [PlaceCategory.Services]:      '🏦 Сервисы',
}

export const PLACE_TYPE_LABELS: Record<number, string> = {
  [PlaceType.Restaurant]:  'Ресторан',
  [PlaceType.Cafe]:        'Кафе',
  [PlaceType.Bar]:         'Бар',
  [PlaceType.Museum]:      'Музей',
  [PlaceType.Park]:        'Парк',
  [PlaceType.Hotel]:       'Отель',
  [PlaceType.Beach]:       'Пляж',
  [PlaceType.NightClub]:   'Клуб',
  // добавляй по мере необходимости
}

export const MOOD_LABELS: Record<MoodType, string> = {
  [MoodType.WithCompany]:  '👫 С компанией',
  [MoodType.Solo]:         '🧘 Один',
  [MoodType.WithFamily]:   '👨‍👩‍👧 С семьёй',
  [MoodType.RomanticDate]: '💑 Вдвоём',
  [MoodType.Corporate]:    '🏢 Корпоратив',
  [MoodType.Special]:      '🔥 Что-то особенное',
  [MoodType.Calm]:         '😌 Тихо и спокойно',
  [MoodType.Surprise]:     '🎲 Удиви меня',
  [MoodType.Active]:       '⚡ Активно',
  [MoodType.Cultural]:     '🏛️ Культурно',
  [MoodType.Foodie]:       '🍽️ Вкусно поесть',
  [MoodType.NightOut]:     '🌙 Вечер',
  [MoodType.Nature]:       '🌿 Природа',
}

export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

export function getCategoryLabel(category: PlaceCategory): string {
  return CATEGORY_LABELS[category] ?? 'Место'
}

export function getMoodLabel(mood: MoodType): string {
  return MOOD_LABELS[mood] ?? mood.toString()
}
export function getCategoryEmoji(category: PlaceCategory): string {
  const label = CATEGORY_LABELS[category] ?? '📍'
  return label.split(' ')[0]
}

