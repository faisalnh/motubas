import { ReminderType } from '@prisma/client';
import { addMonths, addDays } from 'date-fns';

interface ReminderInterval {
  months?: number;
  kilometers?: number;
}

const REMINDER_INTERVALS: Record<ReminderType, ReminderInterval> = {
  OIL_CHANGE: { months: 6, kilometers: 5000 },
  BRAKE_FLUID: { months: 24 },
  COOLANT: { months: 24, kilometers: 40000 },
  TRANSMISSION_FLUID: { kilometers: 40000 },
  TIRE_ROTATION: { kilometers: 10000 },
  AIR_FILTER: { kilometers: 10000 },
  SPARK_PLUG: { kilometers: 20000 },
  TIMING_BELT: { kilometers: 60000 },
};

export function calculateDueDate(
  reminderType: ReminderType,
  lastServiceDate: Date
): Date | null {
  const interval = REMINDER_INTERVALS[reminderType];
  if (!interval.months) return null;
  return addMonths(lastServiceDate, interval.months);
}

export function calculateDueMileage(
  reminderType: ReminderType,
  lastServiceMileage: number
): number | null {
  const interval = REMINDER_INTERVALS[reminderType];
  if (!interval.kilometers) return null;
  return lastServiceMileage + interval.kilometers;
}

export function isReminderDueSoon(
  dueDate: Date | null,
  dueMileage: number | null,
  currentMileage: number
): boolean {
  const today = new Date();
  const sevenDaysFromNow = addDays(today, 7);
  const mileageBuffer = 500; // Warn if within 500km

  if (dueDate && dueDate <= sevenDaysFromNow) {
    return true;
  }

  if (dueMileage && currentMileage >= dueMileage - mileageBuffer) {
    return true;
  }

  return false;
}

export function isReminderOverdue(
  dueDate: Date | null,
  dueMileage: number | null,
  currentMileage: number
): boolean {
  const today = new Date();

  if (dueDate && dueDate < today) {
    return true;
  }

  if (dueMileage && currentMileage >= dueMileage) {
    return true;
  }

  return false;
}

export function getReminderTypeLabel(type: ReminderType): string {
  const labels: Record<ReminderType, string> = {
    OIL_CHANGE: 'Ganti Oli',
    BRAKE_FLUID: 'Ganti Minyak Rem',
    COOLANT: 'Ganti Coolant',
    TRANSMISSION_FLUID: 'Ganti Oli Transmisi',
    TIRE_ROTATION: 'Rotasi Ban',
    AIR_FILTER: 'Ganti Filter Udara',
    SPARK_PLUG: 'Ganti Busi',
    TIMING_BELT: 'Ganti Timing Belt',
  };
  return labels[type];
}
