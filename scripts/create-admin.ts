/**
 * Admin Setup Script
 * Creates initial admin account
 * 
 * Usage: npx tsx scripts/create-admin.ts
 */

import { createAdminAccount, AdminRole } from '../src/lib/admin-auth';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🔐 Norvis AI - Admin Account Setup\n');
  console.log('This script will create an initial admin account.\n');

  try {
    const email = await question('Admin Email: ');
    const username = await question('Admin Username: ');
    const name = await question('Admin Name: ');
    const password = await question('Admin Password: ');
    const confirmPassword = await question('Confirm Password: ');

    // Validation
    if (!email || !username || !name || !password) {
      console.error('\n❌ All fields are required!');
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.error('\n❌ Passwords do not match!');
      process.exit(1);
    }

    if (password.length < 3) {
      console.error('\n❌ Password must be at least 3 characters!');
      process.exit(1);
    }

    // Create admin account
    console.log('\n⏳ Creating admin account...\n');
    
    const result = await createAdminAccount(
      email.trim(),
      username.trim(),
      password,
      name.trim(),
      AdminRole.SUPER_ADMIN
    );

    if (result.success) {
      console.log('✅ Admin account created successfully!\n');
      console.log('Admin Details:');
      console.log(`  Email: ${result.admin?.email}`);
      console.log(`  Username: ${result.admin?.username}`);
      console.log(`  Role: ${result.admin?.role}`);
      console.log(`\n🚀 You can now login at: http://localhost:3000/admin\n`);
    } else {
      console.error(`\n❌ Failed to create admin account: ${result.error}\n`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
