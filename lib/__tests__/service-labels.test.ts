import { describe, it, expect } from 'vitest';
import { ServiceType } from '@prisma/client';
import {
    serviceTypeLabels,
    getServiceTypeLabel,
    serviceTypeOptions,
} from '../service-labels';

describe('service-labels', () => {
    describe('serviceTypeLabels', () => {
        it('should have Indonesian labels for all service types', () => {
            expect(serviceTypeLabels.OIL_CHANGE).toBe('Ganti Oli');
            expect(serviceTypeLabels.BRAKE_SERVICE).toBe('Service Rem');
            expect(serviceTypeLabels.TIRE_ROTATION).toBe('Rotasi Ban');
            expect(serviceTypeLabels.ENGINE_CHECK).toBe('Cek Mesin');
            expect(serviceTypeLabels.TRANSMISSION).toBe('Service Transmisi');
            expect(serviceTypeLabels.GENERAL_SERVICE).toBe('Service Umum');
            expect(serviceTypeLabels.CUSTOM).toBe('Lainnya');
        });

        it('should cover all ServiceType enum values', () => {
            const enumValues: ServiceType[] = [
                'OIL_CHANGE',
                'BRAKE_SERVICE',
                'TIRE_ROTATION',
                'ENGINE_CHECK',
                'TRANSMISSION',
                'GENERAL_SERVICE',
                'CUSTOM',
            ];

            enumValues.forEach((value) => {
                expect(serviceTypeLabels[value]).toBeDefined();
                expect(typeof serviceTypeLabels[value]).toBe('string');
            });
        });
    });

    describe('getServiceTypeLabel', () => {
        it('should return correct label for known service types', () => {
            expect(getServiceTypeLabel('OIL_CHANGE')).toBe('Ganti Oli');
            expect(getServiceTypeLabel('BRAKE_SERVICE')).toBe('Service Rem');
        });
    });

    describe('serviceTypeOptions', () => {
        it('should return array of options for dropdowns', () => {
            expect(Array.isArray(serviceTypeOptions)).toBe(true);
            expect(serviceTypeOptions.length).toBe(7);
        });

        it('should have value and label for each option', () => {
            serviceTypeOptions.forEach((option) => {
                expect(option).toHaveProperty('value');
                expect(option).toHaveProperty('label');
                expect(typeof option.label).toBe('string');
            });
        });

        it('should have OIL_CHANGE as first option', () => {
            expect(serviceTypeOptions[0].value).toBe('OIL_CHANGE');
            expect(serviceTypeOptions[0].label).toBe('Ganti Oli');
        });
    });
});
