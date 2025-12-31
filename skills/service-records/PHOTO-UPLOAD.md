# Invoice Photo Upload Workflow

## Complete Upload Process

```
Photo Upload Workflow:
- [ ] Step 1: Client-side file validation
- [ ] Step 2: Client-side image compression (max 1MB)
- [ ] Step 3: Show compression progress to user
- [ ] Step 4: Upload to Vercel Blob Storage
- [ ] Step 5: Store URL in database
```

## Step 1: Client-Side Validation

```typescript
function validateFile(file: File): string | null {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return 'Format file harus JPG, PNG, atau WebP';
  }

  // Check file size (before compression)
  const maxSize = 10 * 1024 * 1024; // 10MB max before compression
  if (file.size > maxSize) {
    return 'Ukuran file maksimal 10MB';
  }

  return null; // Valid
}
```

## Step 2: Client-Side Compression

```typescript
'use client';

import imageCompression from 'browser-image-compression';
import { useState } from 'react';

export function InvoiceUpload({ onUploadComplete }: { onUploadComplete: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }

    setUploading(true);

    try {
      // Compress with progress tracking
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        onProgress: (progress: number) => {
          setCompressionProgress(progress);
        },
      };

      const compressedFile = await imageCompression(file, options);

      // Upload compressed file
      const formData = new FormData();
      formData.append('file', compressedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload gagal');
      }

      const { url } = await response.json();
      onUploadComplete(url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Gagal mengupload foto');
    } finally {
      setUploading(false);
      setCompressionProgress(0);
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && (
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            Kompres gambar: {Math.round(compressionProgress)}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${compressionProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

## Step 3: Server-Side Upload Handler

Create `/api/upload/route.ts`:

```typescript
import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate size (should be ≤ 1MB after compression)
    if (file.size > 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Max 1MB after compression' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const filename = `invoices/${session.user.id}/${Date.now()}-${file.name}`;
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

## Step 4: Display Uploaded Image

```typescript
import Image from 'next/image';

function InvoicePreview({ url }: { url: string }) {
  return (
    <div className="mt-4">
      <p className="text-sm font-medium mb-2">Foto Nota:</p>
      <div className="relative w-full max-w-md aspect-[3/4]">
        <Image
          src={url}
          alt="Invoice"
          fill
          className="object-contain rounded-lg border"
        />
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-600 hover:underline mt-2 inline-block"
      >
        Lihat ukuran penuh →
      </a>
    </div>
  );
}
```

## Error Handling

Handle common errors with Indonesian messages:

```typescript
const errorMessages = {
  'File too large': 'Ukuran file terlalu besar. Maksimal 10MB',
  'Invalid file type': 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP',
  'Upload failed': 'Gagal mengupload foto. Silakan coba lagi',
  'Network error': 'Koneksi terputus. Periksa internet Anda',
};
```

## Compression Settings Explained

```typescript
const compressionOptions = {
  maxSizeMB: 1,              // Target max 1MB (as per requirement)
  maxWidthOrHeight: 1920,    // Maintain quality for readable invoices
  useWebWorker: true,        // Use web worker for non-blocking compression
  fileType: 'image/jpeg',    // Convert to JPEG for best compression
  initialQuality: 0.8,       // Start with 80% quality
};
```

## Important Notes

- Compression happens **client-side** to reduce server load
- Progress tracking improves UX during compression
- Vercel Blob automatically handles CDN and caching
- Images are stored with user ID in path for organization
- Always show preview after upload for user confirmation
- Delete old blob if user re-uploads (optional cleanup)

## Cleanup Old Images (Optional)

```typescript
import { del } from '@vercel/blob';

async function replaceInvoicePhoto(oldUrl: string, newFile: File) {
  // Upload new photo
  const newUrl = await uploadPhoto(newFile);

  // Delete old photo from blob storage
  if (oldUrl) {
    try {
      await del(oldUrl);
    } catch (error) {
      console.error('Failed to delete old photo:', error);
      // Continue anyway - new photo is uploaded
    }
  }

  return newUrl;
}
```
