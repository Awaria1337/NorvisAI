/**
 * Reset Admin Users Script
 * Deletes all existing admins and creates a fresh admin user
 */

import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function resetAdmin() {
  try {
    console.log('\n🔄 Resetting admin users...\n');

    // Step 1: Delete all existing admins
    console.log('🗑️  Deleting all existing admin users...');
    const deleteResult = await prisma.admin.deleteMany({});
    console.log(`   Deleted ${deleteResult.count} admin user(s)\n`);

    // Step 2: Create new admin
    console.log('🔐 Creating new admin user...');
    
    const email = 'admin@admin.com';
    const username = 'admin';
    const name = 'Admin';
    const password = '12345678';
    const role = 'admin';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        active: true
      }
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ADMIN LOGIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Email:    ${admin.email}`);
    console.log(`  Username: admin`);
    console.log(`  Password: 12345678`);
    console.log(`  Name:     ${admin.name}`);
    console.log(`  Role:     ${admin.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n🚀 Login URL: http://localhost:3000/admin/login\n`);

  } catch (error) {
    console.error('❌ Error resetting admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin();
