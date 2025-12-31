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
            return NextResponse.json(
                { error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP' },
                { status: 400 }
            );
        }

        // Validate size (should be ≤ 1MB after compression)
        const maxSize = 1024 * 1024; // 1MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'Ukuran file terlalu besar. Maksimal 1MB setelah kompresi' },
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
            { error: 'Gagal mengupload foto. Silakan coba lagi' },
            { status: 500 }
        );
    }
}
