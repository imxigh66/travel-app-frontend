/**
 * Форматирует дату в относительное время на русском языке
 * @param {string|Date} date - Дата для форматирования
 * @returns {string} - Отформатированная строка типа "5 минут назад"
 */
export function formatDistanceToNow(date) {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  // Меньше минуты
  if (diffInSeconds < 60) {
    return 'только что';
  }

  // Минуты
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${pluralize(diffInMinutes, 'минуту', 'минуты', 'минут')} назад`;
  }

  // Часы
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${pluralize(diffInHours, 'час', 'часа', 'часов')} назад`;
  }

  // Дни
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${pluralize(diffInDays, 'день', 'дня', 'дней')} назад`;
  }

  // Недели
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${pluralize(diffInWeeks, 'неделю', 'недели', 'недель')} назад`;
  }

  // Месяцы
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${pluralize(diffInMonths, 'месяц', 'месяца', 'месяцев')} назад`;
  }

  // Годы
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${pluralize(diffInYears, 'год', 'года', 'лет')} назад`;
}

/**
 * Форматирует дату в полный формат
 * @param {string|Date} date - Дата для форматирования
 * @returns {string} - Дата в формате "12 февраля 2026"
 */
export function formatFullDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Форматирует дату в короткий формат
 * @param {string|Date} date - Дата для форматирования
 * @returns {string} - Дата в формате "12.02.2026"
 */
export function formatShortDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Форматирует дату и время
 * @param {string|Date} date - Дата для форматирования
 * @returns {string} - Дата и время в формате "12.02.2026, 14:30"
 */
export function formatDateTime(date) {
  return new Date(date).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Проверяет, была ли дата сегодня
 * @param {string|Date} date - Дата для проверки
 * @returns {boolean}
 */
export function isToday(date) {
  const today = new Date();
  const checkDate = new Date(date);
  
  return today.getFullYear() === checkDate.getFullYear() &&
         today.getMonth() === checkDate.getMonth() &&
         today.getDate() === checkDate.getDate();
}

/**
 * Проверяет, была ли дата вчера
 * @param {string|Date} date - Дата для проверки
 * @returns {boolean}
 */
export function isYesterday(date) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const checkDate = new Date(date);
  
  return yesterday.getFullYear() === checkDate.getFullYear() &&
         yesterday.getMonth() === checkDate.getMonth() &&
         yesterday.getDate() === checkDate.getDate();
}

/**
 * Возвращает правильную форму слова в зависимости от числа (русская грамматика)
 * @param {number} count - Число
 * @param {string} one - Форма для 1 (минуту)
 * @param {string} few - Форма для 2-4 (минуты)
 * @param {string} many - Форма для 5+ (минут)
 * @returns {string}
 */
function pluralize(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return one;
  }
  
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return few;
  }
  
  return many;
}