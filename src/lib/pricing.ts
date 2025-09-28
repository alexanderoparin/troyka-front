export interface PricingPlan {
  id: string
  name: string
  credits: number
  priceRub: number
  unitPriceRubComputed: number
  isActive: boolean
}

export function getPricingPlans(): PricingPlan[] {
  return [
    {
      id: "starter",
      name: "Стартер",
      credits: 100,
      priceRub: 99000, // 990 рублей в копейках
      unitPriceRubComputed: 990, // 9.9 рублей за поинт
      isActive: true,
    },
    {
      id: "pro",
      name: "Профи",
      credits: 300,
      priceRub: 299000, // 2990 рублей в копейках
      unitPriceRubComputed: 997, // 9.97 рублей за поинт
      isActive: true,
    },
    {
      id: "business",
      name: "Бизнес",
      credits: 600,
      priceRub: 549000, // 5490 рублей в копейках
      unitPriceRubComputed: 915, // 9.15 рублей за поинт
      isActive: true,
    },
    {
      id: "premium",
      name: "Премиум",
      credits: 1000,
      priceRub: 899000, // 8990 рублей в копейках
      unitPriceRubComputed: 899, // 8.99 рублей за поинт
      isActive: true,
    },
  ]
}
