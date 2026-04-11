import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function check() {
  const buyer = await prisma.profile.findUnique({ where: { phone: '9841100001' } });
  console.log('Buyer:', buyer);
  if (buyer) {
    const valid = await bcrypt.compare('distro123', buyer.passwordHash);
    console.log('Password valid:', valid);
  }
}

check().finally(() => prisma.$disconnect());
