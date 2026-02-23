import { MoodType } from '../../../entities/place'


export const MOOD_WHO = [
  { mood: MoodType.WithCompany,  emoji: '👫', label: 'С компанией' },
  { mood: MoodType.Solo,         emoji: '🧘', label: 'Один' },
  { mood: MoodType.WithFamily,   emoji: '👨‍👩‍👧', label: 'С семьёй' },
  { mood: MoodType.RomanticDate, emoji: '💑', label: 'Вдвоём' },
  { mood: MoodType.Corporate,    emoji: '🏢', label: 'Корпоратив' },
]

export const MOOD_VIBE = [
  { mood: MoodType.Special,  emoji: '🔥', label: 'Что-то особенное' },
  { mood: MoodType.Calm,     emoji: '😌', label: 'Тихо и спокойно' },
  { mood: MoodType.Surprise, emoji: '🎲', label: 'Удиви меня' },
  { mood: MoodType.Active,   emoji: '⚡', label: 'Активно' },
  { mood: MoodType.Cultural, emoji: '🏛️', label: 'Культурно' },
  { mood: MoodType.Foodie,   emoji: '🍽️', label: 'Вкусно поесть' },
  { mood: MoodType.NightOut, emoji: '🌙', label: 'Вечер' },
  { mood: MoodType.Nature,   emoji: '🌿', label: 'Природа' },
]