import { ServiceType } from '@prisma/client';

export const serviceTypeLabels: Record<ServiceType, string> = {
    OIL_CHANGE: 'Ganti Oli',
    BRAKE_SERVICE: 'Service Rem',
    TIRE_ROTATION: 'Rotasi Ban',
    ENGINE_CHECK: 'Cek Mesin',
    TRANSMISSION: 'Service Transmisi',
    GENERAL_SERVICE: 'Service Umum',
    CUSTOM: 'Lainnya',
};

export function getServiceTypeLabel(type: ServiceType): string {
    return serviceTypeLabels[type] || type;
}

export const serviceTypeOptions = Object.entries(serviceTypeLabels).map(([value, label]) => ({
    value: value as ServiceType,
    label,
}));
