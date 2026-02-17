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

/**
 * Варианты размера изображения для Seedream 4.5 (FAL).
 * Формат как в UI FAL: подпись и разрешение в скобках.
 */
export const SEEDREAM_IMAGE_SIZES = [
  { label: 'Square_HD (1024x1024)', value: 'square_hd' },
  { label: 'Square (512x512)', value: 'square' },
  { label: 'Portrait 3:4 (768x1024)', value: 'portrait_4_3' },
  { label: 'Portrait 9:16 (576x1024)', value: 'portrait_16_9' },
  { label: 'Landscape 4:3 (1024x768)', value: 'landscape_4_3' },
  { label: 'Landscape 16:9 (1024x576)', value: 'landscape_16_9' },
  { label: 'Auto 2K (2048x2048)', value: 'auto_2K' },
  { label: 'Auto 4K (4096x4096)', value: 'auto_4K' },
] as const;

export type SeedreamImageSizeValue = typeof SEEDREAM_IMAGE_SIZES[number]['value'];

export const DEFAULT_SEEDREAM_IMAGE_SIZE: SeedreamImageSizeValue = 'auto_2K';

