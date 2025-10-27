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
 */
export function getRequiredPoints(numImages: number): number {
  return numImages * config.GENERATION_POINTS_PER_IMAGE;
}

