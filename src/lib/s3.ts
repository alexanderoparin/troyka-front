import AWS from 'aws-sdk'
import sharp from 'sharp'

interface S3Config {
  provider: 'YANDEX' | 'TIMEWEB'
  endpoint: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  publicBase?: string
}

class S3Client {
  private s3: AWS.S3
  private config: S3Config

  constructor() {
    this.config = {
      provider: (process.env.S3_PROVIDER as 'YANDEX' | 'TIMEWEB') || 'YANDEX',
      endpoint: process.env.S3_ENDPOINT!,
      region: process.env.S3_REGION!,
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      bucket: process.env.S3_BUCKET!,
      publicBase: process.env.S3_PUBLIC_BASE,
    }

    if (!this.config.endpoint || !this.config.accessKeyId || !this.config.secretAccessKey) {
      throw new Error("S3 configuration is incomplete")
    }

    this.s3 = new AWS.S3({
      endpoint: this.config.endpoint,
      region: this.config.region,
      accessKeyId: this.config.accessKeyId,
      secretAccessKey: this.config.secretAccessKey,
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    })
  }

  async uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<string> {
    const params = {
      Bucket: this.config.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'private', // Приватные объекты
    }

    const result = await this.s3.upload(params).promise()
    return result.Location
  }

  async downloadFile(key: string): Promise<Buffer> {
    const params = {
      Bucket: this.config.bucket,
      Key: key,
    }

    const result = await this.s3.getObject(params).promise()
    return result.Body as Buffer
  }

  async downloadFromUrl(url: string): Promise<Buffer> {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  async createThumbnail(imageBuffer: Buffer, maxWidth = 300, maxHeight = 400): Promise<Buffer> {
    return sharp(imageBuffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer()
  }

  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const params = {
      Bucket: this.config.bucket,
      Key: key,
      Expires: expiresIn,
    }

    return this.s3.getSignedUrlPromise('getObject', params)
  }

  async getPresignedUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
    const params = {
      Bucket: this.config.bucket,
      Key: key,
      ContentType: contentType,
      Expires: expiresIn,
    }

    return this.s3.getSignedUrlPromise('putObject', params)
  }

  getPublicUrl(key: string): string {
    if (this.config.publicBase) {
      return `${this.config.publicBase}/${key}`
    }
    return `${this.config.endpoint}/${this.config.bucket}/${key}`
  }

  generateKey(prefix: string, filename: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2)
    const extension = filename.split('.').pop()
    return `${prefix}/${timestamp}-${random}.${extension}`
  }

  async processAndUploadImage(
    imageUrl: string,
    jobId: string
  ): Promise<{ resultUrl: string; thumbUrl: string }> {
    try {
      // Скачиваем изображение
      const imageBuffer = await this.downloadFromUrl(imageUrl)
      
      // Создаем thumbnail
      const thumbnailBuffer = await this.createThumbnail(imageBuffer)
      
      // Генерируем ключи для файлов
      const resultKey = this.generateKey('results', `${jobId}.jpg`)
      const thumbKey = this.generateKey('thumbs', `${jobId}.jpg`)
      
      // Загружаем файлы
      const [resultUrl, thumbUrl] = await Promise.all([
        this.uploadBuffer(imageBuffer, resultKey, 'image/jpeg'),
        this.uploadBuffer(thumbnailBuffer, thumbKey, 'image/jpeg'),
      ])

      // Возвращаем публичные URL или presigned URL
      return {
        resultUrl: this.config.publicBase 
          ? this.getPublicUrl(resultKey)
          : await this.getPresignedUrl(resultKey, 24 * 3600), // 24 часа
        thumbUrl: this.config.publicBase
          ? this.getPublicUrl(thumbKey)
          : await this.getPresignedUrl(thumbKey, 24 * 3600),
      }
    } catch (error) {
      console.error('Failed to process and upload image:', error)
      throw error
    }
  }
}

export const s3Client = new S3Client()

export async function uploadImageFromUrl(imageUrl: string, jobId: string) {
  return s3Client.processAndUploadImage(imageUrl, jobId)
}

export async function getPresignedUploadUrl(filename: string, contentType: string) {
  const key = s3Client.generateKey('inputs', filename)
  const uploadUrl = await s3Client.getPresignedUploadUrl(key, contentType)
  const assetUrl = s3Client.getPublicUrl(key)
  
  return { uploadUrl, assetUrl, key }
}
