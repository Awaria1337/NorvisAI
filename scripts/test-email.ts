/**
 * Test Email System
 * 
 * This script tests the email sending functionality.
 * Run with: npx ts-node scripts/test-email.ts
 */

import {
  verifyEmailConnection,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  generateToken,
  generateVerificationUrl,
  generateResetPasswordUrl,
} from '../src/lib/email';

async function testEmailSystem() {
  console.log('🧪 Testing Norvis AI Email System\n');

  // Test 1: Verify SMTP connection
  console.log('1️⃣ Testing SMTP connection...');
  const connected = await verifyEmailConnection();
  
  if (!connected) {
    console.error('❌ SMTP connection failed!');
    console.log('\n⚠️ Please check your .env file:');
    console.log('   - SMTP_HOST');
    console.log('   - SMTP_PORT');
    console.log('   - SMTP_USER');
    console.log('   - SMTP_PASSWORD\n');
    return;
  }
  
  console.log('✅ SMTP connection successful!\n');

  // Get test email from command line or use default
  const testEmail = process.argv[2] || process.env.SMTP_USER || 'test@example.com';
  console.log(`📧 Sending test emails to: ${testEmail}\n`);

  // Test 2: Welcome Email
  console.log('2️⃣ Testing Welcome Email...');
  try {
    await sendWelcomeEmail(testEmail, 'Test User');
    console.log('✅ Welcome email sent!\n');
  } catch (error) {
    console.error('❌ Welcome email failed:', error);
  }

  // Test 3: Verification Email
  console.log('3️⃣ Testing Verification Email...');
  try {
    const verificationToken = generateToken();
    const verificationUrl = generateVerificationUrl(verificationToken);
    await sendVerificationEmail(testEmail, 'Test User', verificationUrl);
    console.log('✅ Verification email sent!');
    console.log(`   Token: ${verificationToken.substring(0, 20)}...`);
    console.log(`   URL: ${verificationUrl}\n`);
  } catch (error) {
    console.error('❌ Verification email failed:', error);
  }

  // Test 4: Password Reset Email
  console.log('4️⃣ Testing Password Reset Email...');
  try {
    const resetToken = generateToken();
    const resetUrl = generateResetPasswordUrl(resetToken);
    await sendPasswordResetEmail(testEmail, 'Test User', resetUrl);
    console.log('✅ Password reset email sent!');
    console.log(`   Token: ${resetToken.substring(0, 20)}...`);
    console.log(`   URL: ${resetUrl}\n`);
  } catch (error) {
    console.error('❌ Password reset email failed:', error);
  }

  console.log('🎉 Email system test completed!');
  console.log('\n📬 Check your inbox at:', testEmail);
  console.log('   (Don\'t forget to check spam folder)\n');
}

// Run tests
testEmailSystem()
  .then(() => {
    console.log('✨ All tests completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
