import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { ChatInterface } from '@/components/chat-interface';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Om Motu AI | Motubas',
    description: 'Konsultasi masalah mobil Anda dengan Om Motu, asisten mekanik virtual.',
};

export default async function OmMotuPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Get user with subscription details
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
            name: true,
            subscriptionTier: true,
            aiCreditsRemaining: true,
        },
    });

    if (!user) {
        redirect('/login');
    }

    const initialCredits = user.subscriptionTier === 'PREMIUM' ? 'Unlimited' : user.aiCreditsRemaining;

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Chat dengan Om Motu</h1>
                <p className="text-gray-600">
                    Konsultasikan masalah mobil Anda dengan AI mekanik pintar kami
                </p>
            </div>

            <div className="flex-1">
                <ChatInterface
                    initialCredits={initialCredits}
                    userTier={user.subscriptionTier}
                    userName={user.name || 'Sobat Motu'}
                />
            </div>
        </div>
    );
}
