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

/** Варианты размера для Seedream 4.5 (FAL), по возрастанию разрешения. */
export const SEEDREAM_IMAGE_SIZES = [
  { label: '1K Landscape 16:9 (1024×576)', value: 'landscape_16_9' },
  { label: '1K Portrait 9:16 (576×1024)', value: 'portrait_16_9' },
  { label: '1K Landscape 4:3 (1024×768)', value: 'landscape_4_3' },
  { label: '1K Portrait 3:4 (768×1024)', value: 'portrait_4_3' },
  { label: '1K Square_HD (1024×1024)', value: 'square_hd' },
  { label: '2K Square (2048×2048)', value: 'auto_2K' },
  { label: '4K Landscape 4:3 (4096×3072)', value: '4k_landscape_4_3' },
  { label: '4K Portrait 4:3 (3072×4096)', value: '4k_portrait_4_3' },
  { label: '4K Square (4096×4096)', value: 'auto_4K' },
] as const;

export type SeedreamImageSizeValue = typeof SEEDREAM_IMAGE_SIZES[number]['value'];

export const DEFAULT_SEEDREAM_IMAGE_SIZE: SeedreamImageSizeValue = '4k_landscape_4_3';

