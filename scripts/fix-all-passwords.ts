import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixAllPasswords() {
  try {
    console.log('🔧 Tüm admin şifreleri düzeltiliyor...\n');

    // Tüm adminleri al
    const admins = await prisma.admin.findMany();

    console.log(`📊 ${admins.length} admin bulundu\n`);

    for (const admin of admins) {
      // Şifre zaten hash'li mi kontrol et
      const isHashed = admin.password.startsWith('$2a$') || 
                      admin.password.startsWith('$2b$') || 
                      admin.password.startsWith('$2y$');

      if (!isHashed) {
        console.log(`🔄 ${admin.username} için şifre hash'leniyor...`);
        console.log(`   Mevcut şifre: ${admin.password}`);
        
        // Düz metin şifreyi hash'le
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        
        // Güncelle
        await prisma.admin.update({
          where: { id: admin.id },
          data: { password: hashedPassword }
        });
        
        console.log(`   ✅ Hash'lendi: ${hashedPassword.substring(0, 20)}...\n`);
      } else {
        console.log(`✓ ${admin.username} şifresi zaten hash'li\n`);
      }
    }

    console.log('\n✅ Tüm şifreler başarıyla güncellendi!\n');
    console.log('📋 Güncel Admin Hesapları:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Güncel listeyi göster
    const updatedAdmins = await prisma.admin.findMany({
      select: {
        username: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    updatedAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.username}`);
      console.log(`   📧 Email: ${admin.email}`);
      console.log(`   👑 Rol: ${admin.role}`);
      console.log(`   🔓 Aktif: ${admin.isActive ? 'Evet' : 'Hayır'}`);
      console.log(`   🔑 Şifre: 12345678 (hash'lenmiş)`);
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 Artık giriş yapabilirsiniz: http://localhost:3000/admin/login\n');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllPasswords();
