/**
 * Check existing admin users in database
 */

import { prisma } from '../src/lib/prisma';

async function checkAdmins() {
  try {
    console.log('\n🔍 Checking admin users in database...\n');
    
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        lastLogin: true,
        createdAt: true
      }
    });

    if (admins.length === 0) {
      console.log('❌ No admin users found in database!\n');
      console.log('💡 Create an admin user with: npm run create-admin\n');
      return;
    }

    console.log(`✅ Found ${admins.length} admin user(s):\n`);
    
    admins.forEach((admin, index) => {
      console.log(`Admin #${index + 1}:`);
      console.log(`  ID: ${admin.id}`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Name: ${admin.name}`);
      console.log(`  Role: ${admin.role}`);
      console.log(`  Active: ${admin.active ? '✅' : '❌'}`);
      console.log(`  Last Login: ${admin.lastLogin || 'Never'}`);
      console.log(`  Created: ${admin.createdAt}`);
      console.log('');
    });

    console.log('🔐 Note: Passwords are encrypted and cannot be displayed.');
    console.log('💡 If you forgot your password, you can reset it using reset-admin-password script.\n');

  } catch (error) {
    console.error('❌ Error checking admins:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmins();
