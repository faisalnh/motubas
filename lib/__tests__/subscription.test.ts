import { describe, it, expect } from 'vitest';
import {
    canAddCar,
    canUseAI,
    canReceiveNotifications,
    getAICreditLimit,
    getMaxCars,
} from '../subscription';

describe('subscription utilities', () => {
    describe('canAddCar', () => {
        it('should allow FREE tier to add first car', () => {
            expect(canAddCar('FREE', 0)).toBe(true);
        });

        it('should block FREE tier from adding second car', () => {
            expect(canAddCar('FREE', 1)).toBe(false);
        });

        it('should allow PREMIUM tier to add unlimited cars', () => {
            expect(canAddCar('PREMIUM', 10)).toBe(true);
        });
    });

    describe('canUseAI', () => {
        it('should allow AI usage when credits remain', () => {
            expect(canUseAI(5)).toBe(true);
        });

        it('should block AI usage when no credits remain', () => {
            expect(canUseAI(0)).toBe(false);
        });
    });

    describe('canReceiveNotifications', () => {
        it('should block notifications for FREE tier', () => {
            expect(canReceiveNotifications('FREE')).toBe(false);
        });

        it('should allow notifications for PREMIUM tier', () => {
            expect(canReceiveNotifications('PREMIUM')).toBe(true);
        });
    });

    describe('getAICreditLimit', () => {
        it('should return 10 for FREE tier', () => {
            expect(getAICreditLimit('FREE')).toBe(10);
        });

        it('should return -1 (unlimited) for PREMIUM tier', () => {
            expect(getAICreditLimit('PREMIUM')).toBe(-1);
        });
    });

    describe('getMaxCars', () => {
        it('should return 1 for FREE tier', () => {
            expect(getMaxCars('FREE')).toBe(1);
        });

        it('should return -1 (unlimited) for PREMIUM tier', () => {
            expect(getMaxCars('PREMIUM')).toBe(-1);
        });
    });
});
