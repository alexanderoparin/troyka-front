/**
 * Допустимые соотношения сторон для генерации изображений
 */
export const ASPECT_RATIOS = ['21:9', '16:9', '3:2', '4:3', '5:4', '1:1', '4:5', '3:4', '2:3', '9:16'] as const;

/**
 * Тип для соотношения сторон
 */
export type AspectRatio = typeof ASPECT_RATIOS[number];

/**
 * Дефолтное соотношение сторон
 */
export const DEFAULT_ASPECT_RATIO: AspectRatio = '1:1';

