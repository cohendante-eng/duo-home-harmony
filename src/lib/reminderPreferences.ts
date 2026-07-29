const STORAGE_KEY =
  'duo-reminder-lead-time-minutes';

export const REMINDER_LEAD_TIME_OPTIONS =
  [60, 30, 15] as const;

export type ReminderLeadTimeMinutes =
  (typeof REMINDER_LEAD_TIME_OPTIONS)[number];

const DEFAULT_REMINDER_LEAD_TIME: ReminderLeadTimeMinutes =
  60;

export function isReminderLeadTimeOption(
  value: number
): value is ReminderLeadTimeMinutes {
  return REMINDER_LEAD_TIME_OPTIONS.includes(
    value as ReminderLeadTimeMinutes
  );
}

export function getReminderLeadTimeMinutes():
  ReminderLeadTimeMinutes {
  try {
    if (typeof window === 'undefined') {
      return DEFAULT_REMINDER_LEAD_TIME;
    }

    const stored =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    const parsed =
      stored ? Number(stored) : NaN;

    if (
      Number.isFinite(parsed) &&
      isReminderLeadTimeOption(parsed)
    ) {
      return parsed;
    }

    return DEFAULT_REMINDER_LEAD_TIME;
  } catch {
    return DEFAULT_REMINDER_LEAD_TIME;
  }
}

export function getReminderLeadTimeMs() {
  return (
    getReminderLeadTimeMinutes() *
    60 *
    1000
  );
}

export function setReminderLeadTimeMinutes(
  minutes: ReminderLeadTimeMinutes
) {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      String(minutes)
    );
  } catch {
    // Keep settings quiet if storage is unavailable.
  }
}

export function formatReminderLeadTime(
  minutes: ReminderLeadTimeMinutes
) {
  if (minutes === 60) {
    return '1 hour before';
  }

  return `${minutes} minutes before`;
}