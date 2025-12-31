---
name: service-records
description: Handles service record creation, updates, and invoice photo uploads with compression. Use when implementing service record CRUD operations, photo uploads, or service history features.
---

# Service Record Management

## Service Record Workflow

### Creating a Service Record

Follow this checklist when implementing service record creation:

```
Service Record Creation:
- [ ] Step 1: Validate input data with Zod
- [ ] Step 2: Handle invoice photo upload (if provided)
- [ ] Step 3: Create service record in database
- [ ] Step 4: Update car mileage
- [ ] Step 5: Create/update maintenance reminders
```

**Step 1: Validate Input**

```typescript
import { z } from 'zod';

const serviceRecordSchema = z.object({
  serviceDate: z.date(),
  mileageAtService: z.number().positive(),
  serviceType: z.enum([
    'OIL_CHANGE',
    'BRAKE_SERVICE',
    'TIRE_ROTATION',
    'ENGINE_CHECK',
    'TRANSMISSION',
    'GENERAL_SERVICE',
    'CUSTOM',
  ]),
  customServiceType: z.string().optional(),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  partsReplaced: z.string().optional(),
  serviceLocation: z.string(),
  isSelfService: z.boolean(),
  serviceCost: z.number().optional(),
  invoicePhotoUrl: z.string().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    // Invoice required if cost exists AND NOT self-service
    if (data.serviceCost && !data.isSelfService) {
      return !!data.invoicePhotoUrl;
    }
    return true;
  },
  {
    message: 'Foto nota wajib diupload jika ada biaya service (kecuali service sendiri)',
    path: ['invoicePhotoUrl'],
  }
);
```

**Step 2: Handle Invoice Photo Upload**

See [PHOTO-UPLOAD.md](PHOTO-UPLOAD.md) for complete photo upload workflow with compression.

**Quick example:**

```typescript
// Client-side compression (max 1MB)
import imageCompression from 'browser-image-compression';

const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

const compressedFile = await imageCompression(file, options);

// Upload to Vercel Blob
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

const { url } = await response.json();
```

**Step 3: Create Service Record**

```typescript
const serviceRecord = await db.serviceRecord.create({
  data: {
    carId,
    serviceDate: new Date(serviceDate),
    mileageAtService,
    serviceType,
    customServiceType: serviceType === 'CUSTOM' ? customServiceType : null,
    description,
    partsReplaced,
    serviceLocation: isSelfService ? 'Self Service' : serviceLocation,
    isSelfService,
    serviceCost: serviceCost ? serviceCost : null,
    invoicePhotoUrl: invoicePhotoUrl || null,
    notes,
    entryCreatedAt: new Date(), // Timestamp for backdating transparency
  },
});
```

**Step 4: Update Car Mileage**

```typescript
// Update only if new mileage is higher
const car = await db.car.findUnique({
  where: { id: carId },
  select: { currentMileage: true },
});

if (mileageAtService > car.currentMileage) {
  await db.car.update({
    where: { id: carId },
    data: { currentMileage: mileageAtService },
  });
}
```

**Step 5: Create Maintenance Reminders**

```typescript
import {
  calculateDueDate,
  calculateDueMileage,
} from '@/lib/reminder-calculator';

// Map service types to reminder types
const serviceToReminderMap = {
  OIL_CHANGE: 'OIL_CHANGE',
  BRAKE_SERVICE: 'BRAKE_FLUID',
  TRANSMISSION: 'TRANSMISSION_FLUID',
  // ... add other mappings
};

const reminderType = serviceToReminderMap[serviceType];

if (reminderType) {
  // Mark old reminder as completed
  await db.maintenanceReminder.updateMany({
    where: {
      carId,
      reminderType,
      isCompleted: false,
    },
    data: { isCompleted: true },
  });

  // Create new reminder
  await db.maintenanceReminder.create({
    data: {
      carId,
      reminderType,
      lastServiceDate: serviceDate,
      lastServiceMileage: mileageAtService,
      dueDate: calculateDueDate(reminderType, serviceDate),
      dueMileage: calculateDueMileage(reminderType, mileageAtService),
    },
  });
}
```

## Service Type Labels (Indonesian)

Always use these labels in UI:

```typescript
const serviceTypeLabels = {
  OIL_CHANGE: 'Ganti Oli',
  BRAKE_SERVICE: 'Service Rem',
  TIRE_ROTATION: 'Rotasi Ban',
  ENGINE_CHECK: 'Cek Mesin',
  TRANSMISSION: 'Service Transmisi',
  GENERAL_SERVICE: 'Service Umum',
  CUSTOM: 'Lainnya',
};
```

## Displaying Service Records

### Timeline View

Show records in chronological order with transparency:

```typescript
// Component example
<div className="space-y-4">
  {records.map((record) => (
    <div key={record.id} className="border-b pb-4">
      <h3>{serviceTypeLabels[record.serviceType]}</h3>
      <p className="text-sm text-gray-600">
        {formatDate(record.serviceDate)} • {record.mileageAtService.toLocaleString('id-ID')} km
      </p>
      <p>{record.description}</p>
      
      {/* Show timestamp transparency */}
      {record.createdAt !== record.entryCreatedAt && (
        <p className="text-xs text-orange-600 mt-2">
          ⚠️ Data dimasukkan pada: {formatDateTime(record.createdAt)}
        </p>
      )}
      
      {record.serviceCost && (
        <p className="font-semibold mt-2">
          {formatCurrency(record.serviceCost)}
        </p>
      )}
      
      {record.invoicePhotoUrl && (
        <img src={record.invoicePhotoUrl} alt="Nota" className="mt-2 max-w-xs" />
      )}
    </div>
  ))}
</div>
```

### Filter Options

Provide these filter options:
- By service type (dropdown)
- By date range (date picker)
- By location (text search)
- Self-service only (checkbox)

## Editing Service Records

Allow editing but maintain transparency:

```typescript
await db.serviceRecord.update({
  where: { id: recordId },
  data: {
    ...updateData,
    // entryCreatedAt stays unchanged
    // updatedAt automatically updates
  },
});
```

The difference between `entryCreatedAt` and `updatedAt` shows users the record was modified.

## Validation Rules

**Critical validation rules:**

1. **Invoice Photo Required**
   - IF serviceCost exists
   - AND NOT isSelfService
   - THEN invoicePhotoUrl is required

2. **Custom Service Type**
   - IF serviceType === 'CUSTOM'
   - THEN customServiceType is required

3. **Mileage Validation**
   - mileageAtService must be >= 0
   - Warn if mileageAtService < car.currentMileage (backdating)

4. **Date Validation**
   - serviceDate can be in the past (backdating allowed)
   - Show warning if > 1 year old

## Server Action Example

```typescript
'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function createServiceRecord(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Parse and validate form data
  const data = {
    carId: formData.get('carId') as string,
    serviceDate: new Date(formData.get('serviceDate') as string),
    mileageAtService: parseInt(formData.get('mileageAtService') as string),
    serviceType: formData.get('serviceType') as string,
    description: formData.get('description') as string,
    isSelfService: formData.get('isSelfService') === 'true',
    serviceCost: formData.get('serviceCost') 
      ? parseFloat(formData.get('serviceCost') as string) 
      : null,
    invoicePhotoUrl: formData.get('invoicePhotoUrl') as string | null,
  };

  // Validate with Zod
  const validated = serviceRecordSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  try {
    // Create in transaction
    await db.$transaction(async (tx) => {
      // 1. Create service record
      const record = await tx.serviceRecord.create({
        data: {
          ...validated.data,
          entryCreatedAt: new Date(),
        },
      });

      // 2. Update car mileage
      // 3. Create reminders
      // ... (see steps above)
    });

    return { success: true };
  } catch (error) {
    console.error('Create service error:', error);
    return { error: 'Gagal menyimpan data service' };
  }
}
```

## Important Notes

- **Always** show both `entryCreatedAt` and `updatedAt` to users for transparency
- **Invoice validation** is critical for data integrity
- **Use transactions** when creating service records with side effects
- **Indonesian labels** for all user-facing text
- **Format currency** with `formatCurrency()` from lib/utils
- **Format dates** with `formatDate()` from lib/utils
