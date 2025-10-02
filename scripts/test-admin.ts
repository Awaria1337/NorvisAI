/**
 * Test Admin Account
 * Check if admin exists and test password
 */

import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🔍 Admin Account Tester\n');

  try {
    // List all admins
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        password: true
      }
    });

    if (admins.length === 0) {
      console.log('❌ No admin accounts found in database!');
      console.log('\n📝 Create an admin account first:');
      console.log('   npx tsx scripts/create-admin.ts\n');
      process.exit(1);
    }

    console.log(`✅ Found ${admins.length} admin account(s):\n`);
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Active: ${admin.isActive ? '✅ Yes' : '❌ No'}`);
      console.log(`   Password starts with: ${admin.password.substring(0, 10)}...`);
      console.log(`   Password length: ${admin.password.length}`);
      console.log(`   Is bcrypt hash: ${admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$') ? '✅ Yes' : '❌ No (PROBLEM!)'}`);
      console.log('');
    });

    // Ask which admin to test
    const identifier = await question('Enter username or email to test: ');
    const password = await question('Enter password to test: ');

    console.log('\n🔐 Testing authentication...\n');

    const admin = admins.find(a => 
      a.username === identifier || a.email === identifier
    );

    if (!admin) {
      console.log('❌ Admin not found with that username/email');
      process.exit(1);
    }

    console.log('✅ Admin found!');
    console.log(`   Testing password for: ${admin.name} (${admin.username})`);

    // Test password
    const isValid = await bcrypt.compare(password, admin.password);

    if (isValid) {
      console.log('\n✅ ✅ ✅ PASSWORD IS CORRECT! ✅ ✅ ✅');
      console.log('\n🎉 You should be able to login with these credentials:');
      console.log(`   Username: ${admin.username}`);
      console.log(`   Password: [the password you just entered]`);
      console.log('\n🚀 Try logging in at: http://localhost:3000/admin\n');
    } else {
      console.log('\n❌ ❌ ❌ PASSWORD IS INCORRECT! ❌ ❌ ❌');
      console.log('\n💡 Solutions:');
      console.log('   1. Use the correct password');
      console.log('   2. Reset password with: npx tsx scripts/hash-password.ts');
      console.log('   3. Create new admin with: npx tsx scripts/create-admin.ts\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();
