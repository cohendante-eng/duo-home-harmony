import {
  supabase,
} from './supabase';

const STORAGE_KEY =
  'duo-reminder-lead-time-minutes';

const USER_METADATA_KEY =
  'reminder_lead_time_minutes';

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

function readLocalReminderLeadTime():
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

function writeLocalReminderLeadTime(
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

function readMetadataReminderLeadTime(
  metadata:
    | Record<string, unknown>
    | null
    | undefined
):
  | ReminderLeadTimeMinutes
  | null {
  const raw =
    metadata?.[
      USER_METADATA_KEY
    ];

  const parsed =
    typeof raw === 'number'
      ? raw
      : typeof raw === 'string'
        ? Number(raw)
        : NaN;

  if (
    Number.isFinite(parsed) &&
    isReminderLeadTimeOption(parsed)
  ) {
    return parsed;
  }

  return null;
}

export function getReminderLeadTimeMinutes():
  ReminderLeadTimeMinutes {
  return readLocalReminderLeadTime();
}

export async function loadReminderLeadTimeMinutes():
  Promise<ReminderLeadTimeMinutes> {
  const {
    data,
    error,
  } =
    await supabase.auth.getUser();

  if (error) {
    return readLocalReminderLeadTime();
  }

  const metadataValue =
    readMetadataReminderLeadTime(
      data.user?.user_metadata
    );

  if (metadataValue) {
    writeLocalReminderLeadTime(
      metadataValue
    );

    return metadataValue;
  }

  return readLocalReminderLeadTime();
}

export async function setReminderLeadTimeMinutes(
  minutes: ReminderLeadTimeMinutes
) {
  writeLocalReminderLeadTime(
    minutes
  );

  const {
    error,
  } =
    await supabase.auth.updateUser({
      data: {
        [USER_METADATA_KEY]:
          minutes,
      },
    });

  if (error) {
    throw error;
  }
}

export function getReminderLeadTimeMs() {
  return (
    getReminderLeadTimeMinutes() *
    60 *
    1000
  );
}

export function formatReminderLeadTime(
  minutes: ReminderLeadTimeMinutes
) {
  if (minutes === 60) {
    return '1 hour before';
  }

  return `${minutes} minutes before`;
}
