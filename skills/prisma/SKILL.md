---
name: prisma-patterns
description: Provides Prisma ORM query patterns, best practices, and common database operations for the Motubas application. Use when working with database queries, Prisma schema modifications, or data relationships.
---

# Prisma Patterns for Motubas

## Database Client Setup

Always use the singleton client from `lib/db.ts`:

```typescript
import { db } from '@/lib/db';
```

Never create new PrismaClient instances. The singleton includes the PostgreSQL adapter required for Vercel serverless.

## Common Query Patterns

### Get User with Cars and Recent Services

```typescript
const user = await db.user.findUnique({
  where: { id: userId },
  include: {
    cars: {
      include: {
        serviceRecords: {
          orderBy: { serviceDate: 'desc' },
          take: 5,
        },
        reminders: {
          where: { isCompleted: false },
          orderBy: { dueDate: 'asc' },
        },
      },
    },
  },
});
```

### Create Service Record with Auto-Reminders

When creating a service record, automatically create maintenance reminders:

```typescript
// 1. Create the service record
const serviceRecord = await db.serviceRecord.create({
  data: {
    carId,
    serviceDate,
    mileageAtService,
    serviceType,
    description,
    // ... other fields
  },
});

// 2. Create reminders based on service type
import { calculateDueDate, calculateDueMileage } from '@/lib/reminder-calculator';

if (serviceType === 'OIL_CHANGE') {
  await db.maintenanceReminder.create({
    data: {
      carId,
      reminderType: 'OIL_CHANGE',
      lastServiceDate: serviceDate,
      lastServiceMileage: mileageAtService,
      dueDate: calculateDueDate('OIL_CHANGE', serviceDate),
      dueMileage: calculateDueMileage('OIL_CHANGE', mileageAtService),
    },
  });
}
```

### Check Free Tier Limits

Before allowing car creation:

```typescript
const carCount = await db.car.count({
  where: { userId },
});

const user = await db.user.findUnique({
  where: { id: userId },
  select: { subscriptionTier: true },
});

import { canAddCar } from '@/lib/subscription';

if (!canAddCar(user.subscriptionTier, carCount)) {
  return { error: 'Tier FREE hanya bisa menambah 1 mobil' };
}
```

### Get Service Records with Filters

```typescript
const records = await db.serviceRecord.findMany({
  where: {
    carId,
    serviceType: serviceTypeFilter, // Optional filter
    serviceDate: {
      gte: startDate,
      lte: endDate,
    },
  },
  orderBy: { serviceDate: 'desc' },
  include: {
    bengkel: true, // Include workshop if verified
  },
});
```

### Calculate Service Cost Analytics

```typescript
const costAnalytics = await db.serviceRecord.aggregate({
  where: { carId },
  _sum: { serviceCost: true },
  _avg: { serviceCost: true },
  _count: true,
});

// Group by service type
const costByType = await db.serviceRecord.groupBy({
  by: ['serviceType'],
  where: { carId },
  _sum: { serviceCost: true },
  _count: true,
});
```

## Transaction Patterns

Use transactions for operations that must succeed together:

```typescript
await db.$transaction(async (tx) => {
  // 1. Create service record
  const service = await tx.serviceRecord.create({
    data: { /* ... */ },
  });

  // 2. Update car mileage
  await tx.car.update({
    where: { id: carId },
    data: { currentMileage: newMileage },
  });

  // 3. Mark old reminder as completed
  await tx.maintenanceReminder.updateMany({
    where: {
      carId,
      reminderType: serviceType,
      isCompleted: false,
    },
    data: { isCompleted: true },
  });

  // 4. Create new reminder
  await tx.maintenanceReminder.create({
    data: { /* ... */ },
  });
});
```

## Schema Modification Best Practices

### Before Modifying Schema

1. Test changes locally first
2. Run `npx prisma format` to format schema
3. Run `npx prisma validate` to check for errors
4. Create migration: `npx prisma migrate dev --name descriptive_name`
5. Run `npx prisma generate` to update client

### Migration Naming

Use descriptive names:
- ✅ Good: `add_service_cost_field`, `create_bengkel_table`
- ❌ Bad: `migration1`, `update`, `fix`

## Error Handling

Always handle Prisma errors gracefully:

```typescript
try {
  const result = await db.user.create({
    data: { email, password, name },
  });
  return { success: true, data: result };
} catch (error) {
  if (error.code === 'P2002') {
    // Unique constraint violation
    return { error: 'Email sudah terdaftar' };
  }
  console.error('Database error:', error);
  return { error: 'Terjadi kesalahan pada database' };
}
```

Common Prisma error codes:
- `P2002`: Unique constraint violation
- `P2025`: Record not found
- `P2003`: Foreign key constraint violation

## Performance Tips

### Use Select to Limit Fields

Only fetch fields you need:

```typescript
const user = await db.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    name: true,
    // Don't fetch password hash
  },
});
```

### Use Indexes for Frequent Queries

Already indexed in schema:
- `cars.userId`
- `serviceRecords.carId`
- `serviceRecords.serviceDate`
- `maintenanceReminders.carId`
- `maintenanceReminders.isCompleted`

## Testing Database Operations

Use Prisma Studio for manual testing:

```bash
npx prisma studio
```

Opens at http://localhost:5555 with GUI for all tables.

## Important Notes

- Always use transactions for related operations
- Never expose password hashes in queries (use `select` to exclude)
- Check subscription tier before allowing tier-restricted operations
- Use Indonesian error messages for user-facing errors
- Validate data with Zod before database operations
