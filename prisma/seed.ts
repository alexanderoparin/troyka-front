import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Создание планов подписки...')
  
  // Создаем планы по требованиям
  const plans = [
    {
      name: 'Стартер',
      credits: 100,
      priceRub: 990,
      unitPriceRubComputed: 990 / 100,
    },
    {
      name: 'Профи',
      credits: 300,
      priceRub: 2990,
      unitPriceRubComputed: 2990 / 300,
    },
    {
      name: 'Бизнес',
      credits: 600,
      priceRub: 5490,
      unitPriceRubComputed: 5490 / 600,
    },
    {
      name: 'Премиум',
      credits: 1000,
      priceRub: 8990,
      unitPriceRubComputed: 8990 / 1000,
    },
  ]

  for (const plan of plans) {
    const created = await prisma.plan.create({
      data: plan,
    })
    console.log(`✅ План "${created.name}": ${created.credits} поинтов за ${created.priceRub} ₽`)
  }

  console.log('✅ Сиды успешно применены!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Ошибка при применении сидов:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
