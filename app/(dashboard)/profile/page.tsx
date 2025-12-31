import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { ProfileForm, PasswordForm, SubscriptionCard } from '@/components/profile/client-components';

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Profil Pengguna</h1>
                <p className="text-gray-600 mt-1">
                    Kelola informasi akun dan langganan Anda
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <ProfileForm
                        initialName={user.name || ''}
                        email={user.email || ''}
                    />
                    <PasswordForm hasPassword={!!user.password} />
                </div>

                <div>
                    <SubscriptionCard
                        tier={user.subscriptionTier}
                        credits={user.aiCreditsRemaining}
                    />
                </div>
            </div>
        </div>
    );
}
