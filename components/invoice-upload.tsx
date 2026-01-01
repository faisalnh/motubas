'use client';

import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface InvoiceUploadProps {
    onUploadComplete: (url: string) => void;
    initialUrl?: string;
    disabled?: boolean;
}

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

export function InvoiceUpload({ onUploadComplete, initialUrl, disabled }: InvoiceUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState(0);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(initialUrl || null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
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
                const data = await response.json();
                throw new Error(data.error || 'Upload gagal');
            }

            const { url } = await response.json();
            setUploadedUrl(url);
            onUploadComplete(url);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err instanceof Error ? err.message : 'Gagal mengupload foto');
        } finally {
            setUploading(false);
            setCompressionProgress(0);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }

    function handleRemove() {
        setUploadedUrl(null);
        onUploadComplete('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    return (
        <div className="space-y-3">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={uploading || disabled}
                className="hidden"
                id="invoice-upload"
            />

            {!uploadedUrl ? (
                <div className="space-y-2">
                    <label
                        htmlFor="invoice-upload"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${uploading || disabled
                            ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                            : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                            }`}
                    >
                        {uploading ? (
                            <div className="text-center p-4 w-full">
                                <p className="text-sm text-gray-600 mb-2">
                                    Mengompresi gambar: {Math.round(compressionProgress)}%
                                </p>
                                <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-orange-500 h-2 rounded-full transition-all"
                                        style={{ width: `${compressionProgress}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                <p className="text-sm text-gray-500">
                                    <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                                </p>
                                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (maks 10MB)</p>
                            </div>
                        )}
                    </label>
                </div>
            ) : (
                <div className="relative">
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={uploadedUrl}
                            alt="Nota service"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemove}
                        disabled={disabled}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <ImageIcon className="h-4 w-4" />
                        <span>Foto nota terupload</span>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}
