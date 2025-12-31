'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { generateMechanicResponse, ChatMessage } from '@/lib/gemini';
import { canUseAI } from '@/lib/subscription';
import { revalidatePath } from 'next/cache';

export async function sendMessage(message: string, history: ChatMessage[], carId?: string) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return { error: 'Anda harus login terlebih dahulu' };
        }

        // Get user with subscription details AND cars
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                subscriptionTier: true,
                aiCreditsRemaining: true,
                name: true,
                cars: {
                    select: {
                        make: true,
                        model: true,
                        year: true,
                        licensePlate: true,
                        currentMileage: true,
                        serviceRecords: {
                            orderBy: { serviceDate: 'desc' },
                            take: 5,
                            select: {
                                serviceDate: true,
                                serviceType: true,
                                mileageAtService: true,
                                description: true,
                            }
                        }
                    }
                }
            },
        });

        if (!user) {
            return { error: 'User tidak ditemukan' };
        }

        // Check credits for FREE tier
        if (user.subscriptionTier === 'FREE' && !canUseAI(user.aiCreditsRemaining)) {
            return { error: 'Kuota chat Om Motu Anda sudah habis bulan ini. Upgrade ke Premium untuk akses tanpa batas!' };
        }

        // Build car context string
        let carContext = '';
        if (user.cars.length === 0) {
            carContext = 'User belum mendaftarkan mobil apapun.';
        } else {
            carContext = user.cars.map((car, index) => {
                const services = car.serviceRecords.map(s =>
                    `- ${s.serviceDate.toLocaleDateString('id-ID')}: ${s.serviceType} (${s.mileageAtService} km) - ${s.description}`
                ).join('\n');

                return `MOBIL ${index + 1}: ${car.make} ${car.model} ${car.year} (${car.licensePlate})
Current KM: ${car.currentMileage}
Riwayat Service Terakhir:
${services || '- Belum ada riwayat service'}`;
            }).join('\n\n');
        }

        // Generate AI response
        // We pass the history AND car context to the AI
        const aiResponseText = await generateMechanicResponse(
            message,
            history,
            user.name || undefined,
            carContext
        );

        // Save conversation to DB
        // For MVP, we'll try to find an existing open conversation or create a new one
        // We'll simplisticly append to the most recent conversation or create one
        const recentConversation = await db.aiConversation.findFirst({
            where: { userId: user.id },
            orderBy: { updatedAt: 'desc' },
        });

        const newHistory = [...history, { role: 'user', parts: message }, { role: 'model', parts: aiResponseText }];

        if (recentConversation) {
            await db.aiConversation.update({
                where: { id: recentConversation.id },
                data: {
                    conversationHistory: JSON.stringify(newHistory),
                    updatedAt: new Date(),
                },
            });
        } else {
            await db.aiConversation.create({
                data: {
                    userId: user.id,
                    carId: carId || null,
                    issueDescription: message.substring(0, 100), // Use first message as description
                    conversationHistory: JSON.stringify(newHistory),
                },
            });
        }

        // Decrement credits for FREE tier
        if (user.subscriptionTier === 'FREE') {
            await db.user.update({
                where: { id: user.id },
                data: {
                    aiCreditsRemaining: {
                        decrement: 1,
                    },
                },
            });
        }

        revalidatePath('/om-motu');

        return {
            response: aiResponseText,
            remainingCredits: user.subscriptionTier === 'FREE' ? user.aiCreditsRemaining - 1 : 'Unlimited',
        };
    } catch (error) {
        console.error('Chat error:', error);
        return { error: 'Maaf, terjadi kesalahan pada sistem Om Motu. Silakan coba lagi nanti.' };
    }
}
