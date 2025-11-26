/**
 * Файл конфигурации приложения
 * Помогает централизованно управлять конфигурацией приложения
 */

export const config = {
  /**
   * Количество поинтов, требуемых для генерации одного изображения
   * Может быть переопределено через переменную окружения GENERATION_POINTS_PER_IMAGE
   */
  GENERATION_POINTS_PER_IMAGE: parseInt(
    process.env.NEXT_PUBLIC_GENERATION_POINTS_PER_IMAGE || '2'
  ),
  /**
   * Количество поинтов, начисляемых при регистрации
   * Может быть переопределено через переменную окружения NEXT_PUBLIC_REGISTRATION_POINTS
   */
  REGISTRATION_POINTS: parseInt(
    process.env.NEXT_PUBLIC_REGISTRATION_POINTS || '4'
  ),
} as const;

/**
 * Возвращает количество поинтов для генерации N изображений
 * @param numImages количество изображений
 * @param model тип модели (nano-banana или nano-banana-pro)
 * @param resolution разрешение (только для nano-banana-pro)
 */
export function getRequiredPoints(
  numImages: number,
  model: 'nano-banana' | 'nano-banana-pro' = 'nano-banana',
  resolution: '1K' | '2K' | '4K' = '1K'
): number {
  if (model === 'nano-banana-pro') {
    const pointsPerImage = {
      '1K': 8,
      '2K': 9,
      '4K': 15,
    }[resolution] || 8;
    return numImages * pointsPerImage;
  }
  // Для nano-banana всегда 2 поинта за изображение
  return numImages * config.GENERATION_POINTS_PER_IMAGE;
}

