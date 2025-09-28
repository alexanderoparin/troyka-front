/**
 * Функция для правильного склонения слова "поинт" в зависимости от числа
 */
export function getPointsText(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  // Исключения для чисел от 11 до 19
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return `${count} поинтов`;
  }

  // Склонение по последней цифре
  if (lastDigit === 1) {
    return `${count} поинт`;
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return `${count} поинта`;
  } else {
    return `${count} поинтов`;
  }
}

/**
 * Функция для правильного склонения слова "изображение" в зависимости от числа
 */
export function getImagesText(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  // Исключения для чисел от 11 до 19
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return `${count} изображений`;
  }

  // Склонение по последней цифре
  if (lastDigit === 1) {
    return `${count} изображение`;
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return `${count} изображения`;
  } else {
    return `${count} изображений`;
  }
}
