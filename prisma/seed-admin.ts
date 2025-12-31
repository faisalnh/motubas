import { db } from '../lib/db';
import { hash } from 'bcryptjs';

async function main() {
    const email = 'admin@motubas.test';
    const password = 'admin123';
    const name = 'Super Admin';

    // Check if user already exists
    const existing = await db.user.findUnique({
        where: { email },
    });

    if (existing) {
        console.log('✓ Admin user already exists:', email);
        return;
    }

    // Create admin user with PREMIUM tier
    const hashedPassword = await hash(password, 12);

    const user = await db.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            subscriptionTier: 'PREMIUM',
            aiCreditsRemaining: 999,
        },
    });

    console.log('✓ Created admin user:');
    console.log('  Email:', email);
    console.log('  Password:', password);
    console.log('  Tier: PREMIUM');
    console.log('  ID:', user.id);
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    });
