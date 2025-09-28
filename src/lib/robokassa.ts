import crypto from 'crypto'

interface RobokassaPaymentParams {
  orderId: string
  amount: number
  description: string
  userEmail?: string
}

interface RobokassaCallbackData {
  InvId: string
  OutSum: string
  SignatureValue: string
  [key: string]: string
}

class RobokassaClient {
  private login: string
  private password1: string
  private password2: string
  private testMode: boolean
  private baseUrl: string

  constructor() {
    this.login = process.env.ROBOKASSA_LOGIN!
    this.password1 = process.env.ROBOKASSA_PASSWORD_1!
    this.password2 = process.env.ROBOKASSA_PASSWORD_2!
    this.testMode = process.env.ROBOKASSA_TEST_MODE === 'true'
    this.baseUrl = this.testMode 
      ? 'https://auth.robokassa.ru/Merchant/Index.aspx'
      : 'https://auth.robokassa.ru/Merchant/Index.aspx'

    if (!this.login || !this.password1 || !this.password2) {
      throw new Error("Robokassa credentials are required")
    }
  }

  createPaymentUrl(params: RobokassaPaymentParams): string {
    const { orderId, amount, description, userEmail } = params
    
    // Создаем подпись для платежа
    const signatureString = `${this.login}:${amount.toFixed(2)}:${orderId}:${this.password1}`
    const signature = crypto.createHash('md5').update(signatureString).digest('hex')

    // Формируем URL параметры
    const urlParams = new URLSearchParams({
      MerchantLogin: this.login,
      OutSum: amount.toFixed(2),
      InvId: orderId,
      Description: description,
      SignatureValue: signature,
      Culture: 'ru',
      ...(userEmail && { Email: userEmail }),
      ...(this.testMode && { IsTest: '1' }),
    })

    return `${this.baseUrl}?${urlParams.toString()}`
  }

  verifyCallback(data: RobokassaCallbackData): boolean {
    const { InvId, OutSum, SignatureValue } = data
    
    // Создаем подпись для проверки
    const signatureString = `${OutSum}:${InvId}:${this.password2}`
    const expectedSignature = crypto.createHash('md5').update(signatureString).digest('hex').toUpperCase()
    
    return SignatureValue.toUpperCase() === expectedSignature
  }

  parseCallback(data: any): RobokassaCallbackData {
    return {
      InvId: data.InvId,
      OutSum: data.OutSum,
      SignatureValue: data.SignatureValue,
      ...data,
    }
  }
}

export const robokassaClient = new RobokassaClient()

export async function createRobokassaPayment(params: RobokassaPaymentParams): Promise<string> {
  return robokassaClient.createPaymentUrl(params)
}

export function verifyRobokassaCallback(data: RobokassaCallbackData): boolean {
  return robokassaClient.verifyCallback(data)
}

export function parseRobokassaCallback(data: any): RobokassaCallbackData {
  return robokassaClient.parseCallback(data)
}
