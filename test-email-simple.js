// Simple email test script
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🧪 Testing Email System...\n');

  // SMTP Configuration from .env (you need to set these manually here for testing)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'zilelimert38@gmail.com',
      pass: process.env.SMTP_PASSWORD, // Your 16-character app password
    },
  });

  console.log('1️⃣ Testing SMTP connection...');
  
  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    console.log('\n⚠️ Make sure your .env file has:');
    console.log('   SMTP_USER="zilelimert38@gmail.com"');
    console.log('   SMTP_PASSWORD="your-16-char-password"');
    return;
  }

  console.log('2️⃣ Sending test email...');
  
  const testEmail = process.argv[2] || process.env.SMTP_USER || 'zilelimert38@gmail.com';
  
  try {
    await transporter.sendMail({
      from: '"Norvis AI" <zilelimert38@gmail.com>',
      to: testEmail,
      subject: '✅ Email System Test - Norvis AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0;">Norvis AI</h1>
          </div>
          <div style="padding: 40px; background: white;">
            <h2 style="color: #1a1a1a;">🎉 Email Sistemi Çalışıyor!</h2>
            <p style="color: #666; font-size: 16px;">
              Bu bir test email'idir. Email sisteminiz başarıyla kuruldu ve çalışıyor!
            </p>
            <p style="color: #666; font-size: 16px;">
              Artık şunları yapabilirsiniz:
            </p>
            <ul style="color: #666; font-size: 16px;">
              <li>Email doğrulama</li>
              <li>Şifre sıfırlama</li>
              <li>Hoşgeldin email'leri</li>
              <li>Bildirimler</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Norvis AI'ye Git
              </a>
            </div>
          </div>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              © 2025 Norvis AI. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      `,
    });

    console.log('✅ Test email sent successfully!\n');
    console.log('📬 Check your inbox at:', testEmail);
    console.log('   (Don\'t forget to check spam folder)\n');
    console.log('🎉 Email system is working perfectly!');
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
  }
}

testEmail()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
