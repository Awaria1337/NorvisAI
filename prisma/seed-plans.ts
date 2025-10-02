import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding plans...');

  // Free Plan
  const freePlan = await prisma.plan.upsert({
    where: { name: 'FREE' },
    update: {
      messageLimit: 25,
      description: 'Norvis.ai\'\u0131 keşfetmek için mükemmel başlangıç planı',
    },
    create: {
      name: 'FREE',
      displayName: 'Ücretsiz Plan',
      description: 'Norvis.ai\'\u0131 keşfetmek için mükemmel başlangıç planı',
      price: 0,
      currency: 'USD',
      messageLimit: 25,
      features: JSON.stringify([
        'Aylık 25 mesaj hakkı',
        'Temel AI modelleri',
        'Sohbet geçmişi',
        'Dosya yükleme',
        'Temel destek'
      ]),
      active: true,
      featured: false,
      displayOrder: 1,
    },
  });

  // Premium Plan
  const premiumPlan = await prisma.plan.upsert({
    where: { name: 'PREMIUM' },
    update: {
      price: 20.00,
      messageLimit: 300,
      description: 'Gelişmiş özellikler ve daha fazla mesaj hakkı ile tam güç',
    },
    create: {
      name: 'PREMIUM',
      displayName: 'Premium Plan',
      description: 'Gelişmiş özellikler ve daha fazla mesaj hakkı ile tam güç',
      price: 20.00,
      currency: 'USD',
      messageLimit: 300,
      features: JSON.stringify([
        'Aylık 300 mesaj hakkı',
        'Tüm AI modelleri (GPT-4, Claude, Gemini)',
        'Görsel oluşturma',
        'Öncelikli yanıt hızı',
        'Sınırsız sohbet geçmişi',
        'Gelişmiş dosya desteği',
        'Öncelikli destek',
        'Reklamsız deneyim'
      ]),
      active: true,
      featured: true,
      displayOrder: 2,
    },
  });

  // Pro Plan
  const proPlan = await prisma.plan.upsert({
    where: { name: 'PRO' },
    update: {
      price: 50.00,
      messageLimit: 700,
    },
    create: {
      name: 'PRO',
      displayName: 'Pro Plan',
      description: 'Profesyonel kullanıcılar için en üst düzey plan',
      price: 50.00,
      currency: 'USD',
      messageLimit: 700,
      features: JSON.stringify([
        'Aylık 700 mesaj hakkı',
        'Tüm AI modelleri (GPT-4, Claude, Gemini)',
        'Sınırsız görsel oluşturma',
        'En yüksek öncelik',
        'Sınırsız sohbet geçmişi',
        'Gelişmiş dosya desteği',
        '7/24 öncelikli destek',
        'API erişimi',
        'Reklamsız deneyim'
      ]),
      active: true,
      featured: false,
      displayOrder: 3,
    },
  });

  // Custom Plan (for manual assignments by admin)
  const customPlan = await prisma.plan.upsert({
    where: { name: 'CUSTOM' },
    update: {
      messageLimit: 5000,
    },
    create: {
      name: 'CUSTOM',
      displayName: 'Özel Plan',
      description: 'Özelleştirilmiş ihtiyaçlar için admin tarafından atanan plan',
      price: 0,
      currency: 'USD',
      messageLimit: 5000,
      features: JSON.stringify([
        'Özel mesaj limiti',
        'Tüm özellikler',
        'Özel destek',
        'API erişimi'
      ]),
      active: false, // Not visible on pricing page
      featured: false,
      displayOrder: 4,
    },
  });

  console.log('✅ Plans seeded successfully:', {
    free: freePlan.id,
    premium: premiumPlan.id,
    pro: proPlan.id,
    custom: customPlan.id,
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding plans:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
