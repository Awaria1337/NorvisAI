/**
 * Password Hash Utility
 * Hash a password for admin account
 * 
 * Usage: npx tsx scripts/hash-password.ts
 */

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
  console.log('\n🔐 Password Hash Generator\n');

  try {
    const password = await question('Enter password to hash: ');
    
    if (!password) {
      console.error('\n❌ Password is required!');
      process.exit(1);
    }

    console.log('\n⏳ Hashing password...\n');
    
    const hash = await bcrypt.hash(password, 12);
    
    console.log('✅ Password hashed successfully!\n');
    console.log('Hashed password:');
    console.log(hash);
    console.log('\n📋 Copy this hash and update your database:\n');
    console.log(`UPDATE admins SET password = '${hash}' WHERE email = 'admin@norvis.ai';\n`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
