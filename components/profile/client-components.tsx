'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { updateProfile, changePassword, upgradeSubscription } from '@/app/actions/profile';
import { User, Lock, Crown, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfileFormProps {
    initialName: string;
    email: string;
}

export function ProfileForm({ initialName, email }: ProfileFormProps) {
    const [name, setName] = useState(initialName);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const result = await updateProfile({ name });

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({ type: 'success', text: 'Profil berhasil diperbarui' });
        }
        setIsLoading(false);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informasi Pribadi
                </CardTitle>
                <CardDescription>Update nama dan lihat email Anda</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={email} disabled className="bg-gray-100" />
                        <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nama Anda"
                            required
                            minLength={2}
                        />
                    </div>
                    {message && (
                        <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            {message.text}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const result = await changePassword({ currentPassword, newPassword });

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({ type: 'success', text: 'Password berhasil diubah' });
            setCurrentPassword('');
            setNewPassword('');
        }
        setIsLoading(false);
    }

    if (!hasPassword) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Keamanan
                    </CardTitle>
                    <CardDescription>Pengaturan password akun</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                        Akun Anda menggunakan login Google. Anda tidak perlu mengatur password.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Ganti Password
                </CardTitle>
                <CardDescription>Demi keamanan, gunakan password yang kuat</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Password Saat Ini</Label>
                        <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">Password Baru</Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    {message && (
                        <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            {message.text}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isLoading} variant="outline">
                        {isLoading ? 'Memproses...' : 'Ganti Password'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}

interface SubscriptionCardProps {
    tier: 'FREE' | 'PREMIUM';
    credits: number;
}

export function SubscriptionCard({ tier, credits }: SubscriptionCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleUpgrade() {
        if (!confirm('Simulasi: Apakah Anda yakin ingin upgrade ke Premium?')) return;

        setIsLoading(true);
        await upgradeSubscription();
        setIsLoading(false);
        router.refresh();
    }

    return (
        <Card className={tier === 'PREMIUM' ? 'border-amber-400 bg-amber-50/50' : ''}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Crown className={`h-5 w-5 ${tier === 'PREMIUM' ? 'text-amber-600' : 'text-gray-500'}`} />
                    Status Langganan
                </CardTitle>
                <CardDescription>Tier dan kuota AI Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border shadow-sm">
                    <div>
                        <p className="text-sm text-gray-500">Tier Saat Ini</p>
                        <p className={`font-bold ${tier === 'PREMIUM' ? 'text-amber-600' : 'text-gray-900'}`}>
                            {tier}
                        </p>
                    </div>
                    {tier === 'FREE' && (
                        <Button size="sm" onClick={handleUpgrade} disabled={isLoading} className="bg-amber-600 hover:bg-amber-700">
                            Upgrade (Demo)
                        </Button>
                    )}
                    {tier === 'PREMIUM' && (
                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                            Aktif
                        </span>
                    )}
                </div>

                <div className="flex justify-between items-center p-3 bg-white rounded-lg border shadow-sm">
                    <div>
                        <p className="text-sm text-gray-500">Sisa Kredit AI</p>
                        <p className="font-bold text-gray-900">
                            {tier === 'PREMIUM' ? 'Unlimited' : credits}
                        </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {tier === 'PREMIUM' ? 'Bebas Tanya!' : '/ 10 per bulan'}
                    </span>
                </div>

                {tier === 'FREE' && (
                    <div className="text-xs text-gray-500 mt-2">
                        <p className="font-medium mb-1">Benefit Premium:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Unlimited mobil (saat ini max 1)</li>
                            <li>Unlimited chat dengan Om Motu</li>
                            <li>Tanpa iklan (future)</li>
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
