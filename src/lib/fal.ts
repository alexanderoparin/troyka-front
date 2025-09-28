interface FalJobParams {
  prompt: string
  // Для генерации с нуля
  negative_prompt?: string
  image_size?: string
  seed?: number
  guidance_scale?: number
  num_inference_steps?: number
  // Для редактирования изображений
  image_urls?: string[]
  num_images?: number
  output_format?: 'jpeg' | 'png'
  sync_mode?: boolean
  // Тип генерации
  generation_type?: 'create' | 'edit'
}

interface FalJobResponse {
  request_id: string
}

interface FalJobResult {
  images: Array<{
    url: string
    width: number
    height: number
  }>
  seed: number
  has_nsfw_concepts: boolean[]
}

class FalClient {
  private apiKey: string
  private baseUrl = "https://fal.run"
  private createModelId: string
  private editModelId: string

  constructor() {
    this.apiKey = process.env.FAL_API_KEY!
    // Правильные эндпоинты nano-banana
    this.createModelId = "fal-ai/nano-banana" // Text to Image
    this.editModelId = "fal-ai/nano-banana/edit" // Image Editing
    
    if (!this.apiKey) {
      throw new Error("FAL_API_KEY is required")
    }
  }

  async createJob(params: FalJobParams): Promise<string> {
    const webhookUrl = `${process.env.PUBLIC_FAL_CALLBACK}?secret=${process.env.FAL_WEBHOOK_SECRET}`
    const hasImages = params.image_urls && params.image_urls.length > 0
    const modelId = hasImages ? this.editModelId : this.createModelId
    
    let payload: any = {
      prompt: params.prompt,
      webhook_url: webhookUrl,
    }

    if (hasImages) {
      // Для редактирования изображений (nano-banana/edit)
      payload = {
        ...payload,
        image_urls: params.image_urls,
        num_images: params.num_images || 1,
        output_format: params.output_format || 'jpeg',
      }
    } else {
      // Для создания с нуля (nano-banana text-to-image)
      payload = {
        ...payload,
        num_images: params.num_images || 1,
        output_format: params.output_format || 'jpeg',
      }
    }

    console.log(`Creating FAL job with model ${modelId}:`, payload)

    const response = await fetch(`${this.baseUrl}/${modelId}`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("FAL API error:", error)
      throw new Error(`FAL API error: ${response.status} ${error}`)
    }

    const result: FalJobResponse = await response.json()
    return result.request_id
  }

  async getJobStatus(requestId: string): Promise<any> {
    // Сначала пробуем text-to-image модель
    try {
      const response = await fetch(`${this.baseUrl}/${this.createModelId}/requests/${requestId}`, {
        headers: {
          "Authorization": `Key ${this.apiKey}`,
        },
      })
      
      if (response.ok) {
        return response.json()
      }
    } catch (error) {
      // Игнорируем ошибку и пробуем другую модель
    }

    // Если не нашли, пробуем edit модель
    const response = await fetch(`${this.baseUrl}/${this.editModelId}/requests/${requestId}`, {
      headers: {
        "Authorization": `Key ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`FAL status check failed: ${response.status}`)
    }

    return response.json()
  }

  private convertAspectRatio(ratio: string): string {
    // Конвертируем соотношения в размеры для FAL
    const ratioMap: Record<string, string> = {
      "1:1": "square_hd",
      "3:4": "portrait_4_3", 
      "4:3": "landscape_4_3",
      "16:9": "landscape_16_9",
    }

    return ratioMap[ratio] || "portrait_4_3"
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto')
    const secret = process.env.FAL_WEBHOOK_SECRET!
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    return `sha256=${expectedSignature}` === signature
  }
}

export const falClient = new FalClient()

export async function createFalJob(params: FalJobParams): Promise<string> {
  return falClient.createJob(params)
}

export async function getFalJobStatus(requestId: string) {
  return falClient.getJobStatus(requestId)
}

export function verifyFalWebhook(payload: string, signature: string): boolean {
  return falClient.verifyWebhookSignature(payload, signature)
}
