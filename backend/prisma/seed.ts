import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

const users = [
    { name: 'Alice Johnson', email: 'alice@leadflow.com', password: 'password123', role: UserRole.ADMIN },
    { name: 'Bob Smith', email: 'bob@leadflow.com', password: 'password123', role: UserRole.AGENT },
    { name: 'Carol Martinez', email: 'carol@leadflow.com', password: 'password123', role: UserRole.AGENT },
    { name: 'David Lee', email: 'david@leadflow.com', password: 'password123', role: UserRole.AGENT },
    { name: 'Eva Chen', email: 'eva@leadflow.com', password: 'password123', role: UserRole.AGENT },
];

async function main() {
    console.log('🌱 Seeding users...\n');

    for (const u of users) {
        const existing = await prisma.user.findUnique({ where: { email: u.email } });
        if (existing) {
            console.log(`  ⚠️  Skipped (already exists): ${u.email}`);
            continue;
        }
        const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS);
        await prisma.user.create({
            data: { name: u.name, email: u.email, passwordHash, role: u.role },
        });
        console.log(`  ✅ Created: ${u.name} <${u.email}> [${u.role}]`);
    }

    console.log('\n✨ Seed complete!');
    console.log('\nCredentials (all passwords: password123):');
    users.forEach(u => console.log(`  ${u.role.padEnd(5)} │ ${u.email}`));
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
