import { db } from '../lib/db';

async function main() {
    const adminEmail = 'admin@motubas.test';

    // Find admin user
    const admin = await db.user.findUnique({
        where: { email: adminEmail },
    });

    if (!admin) {
        console.error('Admin user not found. Run seed-admin.ts first.');
        process.exit(1);
    }

    console.log('Found admin user:', admin.id);

    // Check if car already exists
    const existingCar = await db.car.findFirst({
        where: { userId: admin.id },
    });

    if (existingCar) {
        console.log('✓ Sample data already exists for this user');
        return;
    }

    // Create sample car
    const car = await db.car.create({
        data: {
            userId: admin.id,
            make: 'Toyota',
            model: 'Avanza',
            year: 2018,
            licensePlate: 'B 1234 XYZ',
            currentMileage: 75000,
            isPrimary: true,
        },
    });
    console.log('✓ Created car:', car.make, car.model);

    // Create sample service records
    const services = [
        {
            serviceDate: new Date('2024-06-15'),
            mileageAtService: 65000,
            serviceType: 'OIL_CHANGE' as const,
            description: 'Ganti oli mesin Shell Helix 5W-30, 4 liter. Ganti filter oli.',
            serviceLocation: 'Bengkel Maju Jaya',
            serviceCost: 450000,
        },
        {
            serviceDate: new Date('2024-09-20'),
            mileageAtService: 70000,
            serviceType: 'BRAKE_SERVICE' as const,
            description: 'Cek sistem rem, ganti minyak rem DOT 4. Kondisi kampas rem masih baik.',
            serviceLocation: 'Auto2000 Kelapa Gading',
            serviceCost: 350000,
        },
        {
            serviceDate: new Date('2024-11-10'),
            mileageAtService: 73500,
            serviceType: 'GENERAL_SERVICE' as const,
            description: 'Service berkala 70.000 km. Tune up mesin, ganti busi NGK, cek timing belt.',
            partsReplaced: 'Busi NGK 4 pcs, Filter udara',
            serviceLocation: 'Auto2000 Kelapa Gading',
            serviceCost: 1500000,
        },
    ];

    for (const service of services) {
        await db.serviceRecord.create({
            data: {
                carId: car.id,
                ...service,
                isSelfService: false,
                entryCreatedAt: new Date(),
            },
        });
    }
    console.log('✓ Created', services.length, 'service records');

    // Create sample reminders with different urgency levels
    const reminders = [
        {
            // Overdue - oil change was due
            reminderType: 'OIL_CHANGE' as const,
            lastServiceDate: new Date('2024-06-15'),
            lastServiceMileage: 65000,
            dueDate: new Date('2024-12-15'), // Past due
            dueMileage: 70000, // Past due (current is 75000)
        },
        {
            // Due soon - brake fluid
            reminderType: 'BRAKE_FLUID' as const,
            lastServiceDate: new Date('2024-09-20'),
            lastServiceMileage: 70000,
            dueDate: new Date('2025-01-05'), // Due in 5 days
            dueMileage: null,
        },
        {
            // Normal - timing belt
            reminderType: 'TIMING_BELT' as const,
            lastServiceDate: new Date('2024-11-10'),
            lastServiceMileage: 73500,
            dueDate: null,
            dueMileage: 133500, // Still far away
        },
        {
            // Due soon by mileage - tire rotation
            reminderType: 'TIRE_ROTATION' as const,
            lastServiceDate: new Date('2024-08-01'),
            lastServiceMileage: 68000,
            dueDate: null,
            dueMileage: 75300, // Within 500km buffer
        },
    ];

    for (const reminder of reminders) {
        await db.maintenanceReminder.create({
            data: {
                carId: car.id,
                ...reminder,
                isCompleted: false,
            },
        });
    }
    console.log('✓ Created', reminders.length, 'maintenance reminders');

    console.log('\n✅ Sample data seeded successfully!');
    console.log('   - 1 car: Toyota Avanza 2018');
    console.log('   - 3 service records');
    console.log('   - 4 reminders (1 overdue, 2 due soon, 1 normal)');
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    });
