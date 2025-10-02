const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createNewAdmin() {
  try {
    console.log('🔐 Yeni admin kullanıcısı oluşturuluyor...\n');

    const email = 'admin@norvis.ai';
    const password = 'Admin123!';
    const name = 'Admin User';

    // Mevcut admin var mı kontrol et
    const existingAdmin = await prisma.admin.findFirst({
      where: { email }
    });

    if (existingAdmin) {
      console.log('⚠️  Bu email zaten kullanımda!');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log('\n💡 Farklı bir email kullanın veya mevcut admini silin.');
      return;
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 12);

    // Admin oluştur
    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'admin',
        active: true
      }
    });

    console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!\n');
    console.log('📋 Giriş Bilgileri:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Şifre: ${password}`);
    console.log(`👑 Rol: ${admin.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 Giriş yapmak için: http://localhost:3000/admin/login\n');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createNewAdmin();
