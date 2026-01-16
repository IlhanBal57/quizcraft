import bcrypt from 'bcryptjs';
import { db } from './index.js';
import { users } from './schema.js';
import { eq } from 'drizzle-orm';

async function addUser() {
  const email = 'ilhan.bal@bahcesehir.edu.tr';
  const password = '123456789';
  const hash = await bcrypt.hash(password, 12);

  const existing = await db.select().from(users).where(eq(users.email, email)).get();
  
  if (existing) {
    await db.update(users).set({ passwordHash: hash, role: 'admin' }).where(eq(users.email, email));
    console.log('✅ Kullanıcı güncellendi ve admin yapıldı');
  } else {
    await db.insert(users).values({ email, passwordHash: hash, role: 'admin' });
    console.log('✅ Admin kullanıcı oluşturuldu');
  }
  
  console.log('📧 Email:', email);
  console.log('🔑 Şifre:', password);
  console.log('👑 Rol: admin');
  
  process.exit(0);
}

addUser().catch(e => { console.error(e); process.exit(1); });
