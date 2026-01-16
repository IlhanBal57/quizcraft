import bcrypt from 'bcryptjs';
import { db } from './index.js';
import { users } from './schema.js';
import { eq } from 'drizzle-orm';

async function resetAdmin() {
  console.log('🔄 Resetting admin password...');

  const adminEmail = 'admin@quizcraft.com';
  const adminPassword = 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  // Check if admin exists
  const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).get();

  if (existingAdmin) {
    // Update password
    await db.update(users).set({ passwordHash }).where(eq(users.email, adminEmail));
    console.log(`✅ Admin password updated for: ${adminEmail}`);
  } else {
    // Create admin
    await db.insert(users).values({
      email: adminEmail,
      passwordHash,
      role: 'admin',
    });
    console.log(`✅ Admin user created: ${adminEmail}`);
  }

  console.log(`📧 Email: ${adminEmail}`);
  console.log(`🔑 Password: ${adminPassword}`);
  
  process.exit(0);
}

resetAdmin().catch(e => { console.error(e); process.exit(1); });
