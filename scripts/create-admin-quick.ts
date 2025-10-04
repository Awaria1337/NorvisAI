/**
 * Quick Admin Creation Script
 * Creates admin user with predefined credentials
 */

import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  try {
    console.log('\n🔐 Creating new admin user...\n');

    const email = 'admin@admin.com';
    const username = 'admin';
    const name = 'Admin';
    const password = '1234';
    const role = 'admin';

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { email: email }
        ]
      }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with this email!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log('\n💡 Use a different email or delete the existing admin first.\n');
      return;
    }

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
    console.log('Admin Details:');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Username: admin`);
    console.log(`  Password: 1234`);
    console.log(`  Name: ${admin.name}`);
    console.log(`  Role: ${admin.role}`);
    console.log(`\n🚀 You can now login at: http://localhost:3000/admin/login`);
    console.log(`\n📋 Login Credentials:`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: 1234\n`);

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
