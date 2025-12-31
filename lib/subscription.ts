import { SubscriptionTier } from '@prisma/client';

export function canAddCar(tier: SubscriptionTier, currentCarCount: number): boolean {
  if (tier === 'FREE') {
    return currentCarCount < 1;
  }
  return true; // Premium users can add unlimited cars
}

export function canUseAI(aiCreditsRemaining: number): boolean {
  return aiCreditsRemaining > 0;
}

export function canReceiveNotifications(tier: SubscriptionTier): boolean {
  return tier === 'PREMIUM';
}

export function getAICreditLimit(tier: SubscriptionTier): number {
  return tier === 'FREE' ? 10 : -1; // -1 means unlimited for premium
}

export function getMaxCars(tier: SubscriptionTier): number {
  return tier === 'FREE' ? 1 : -1; // -1 means unlimited for premium
}
