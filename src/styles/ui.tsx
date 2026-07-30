import type {
  CSSProperties,
} from 'react';

import {
  CarFront,
  CreditCard,
  ShoppingBag,
  Calendar,
  Wrench,
} from 'lucide-react';

import type {
  DuoCard,
} from '../types/card';

export const duoColors = {
  bg: '#edf1f5',
  bgSoft: '#f6f8fb',
  card: 'rgba(255,255,255,0.9)',
  cardSolid: '#ffffff',
  text: '#18202c',
  muted: '#758192',
  softMuted: '#9aa4b2',
  border: 'rgba(24,32,44,0.075)',
  borderSoft: 'rgba(24,32,44,0.055)',
  charcoal: '#18202c',
  charcoal2: '#111722',
  blue: '#2f7df6',
  green: '#16a36a',
  amber: '#e18410',
  red: '#e53935',
  slate: '#64748b',
};

export const duoShadows = {
  card:
    '0 18px 48px rgba(31,41,55,0.08), 0 4px 14px rgba(31,41,55,0.045)',
  soft:
    '0 12px 30px rgba(31,41,55,0.06)',
  button:
    '0 16px 36px rgba(17,24,39,0.22)',
};

export const appScreenStyle: CSSProperties = {
  minHeight: '100vh',
  padding: 24,
  paddingBottom: 126,
  maxWidth: 520,
  margin: '0 auto',
};

export const panelScreenStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 100,
  background:
    'linear-gradient(180deg, #f8fafc 0%, #edf1f5 100%)',
  overflowY: 'auto',
  padding: '18px 16px 28px',
};

export const panelInnerStyle: CSSProperties = {
  width: '100%',
  maxWidth: 520,
  minHeight: 'calc(100vh - 36px)',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
};

export const cardSurfaceStyle: CSSProperties = {
  borderRadius: 24,
  background: duoColors.card,
  border: `1px solid ${duoColors.border}`,
  boxShadow: duoShadows.card,
};

export const subtleSurfaceStyle: CSSProperties = {
  borderRadius: 22,
  background: 'rgba(255,255,255,0.78)',
  border: `1px solid ${duoColors.border}`,
  boxShadow: duoShadows.soft,
};

export const primaryButtonStyle: CSSProperties = {
  height: 58,
  borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.22)',
  background:
    'linear-gradient(180deg, #283242 0%, #111722 100%)',
  color: '#fff',
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: duoShadows.button,
};

export const secondaryButtonStyle: CSSProperties = {
  height: 50,
  borderRadius: 18,
  border: `1px solid ${duoColors.border}`,
  background: 'rgba(255,255,255,0.82)',
  color: duoColors.muted,
  fontSize: 14,
  fontWeight: 650,
  cursor: 'pointer',
};

export const dangerButtonStyle: CSSProperties = {
  height: 50,
  borderRadius: 18,
  border: '1px solid rgba(229,57,53,0.14)',
  background: 'rgba(255,255,255,0.82)',
  color: duoColors.red,
  fontSize: 14,
  fontWeight: 650,
  cursor: 'pointer',
};

export const inputStyle: CSSProperties = {
  width: '100%',
  minHeight: 54,
  boxSizing: 'border-box',
  borderRadius: 18,
  border: `1px solid ${duoColors.border}`,
  background: 'rgba(255,255,255,0.82)',
  padding: '0 15px',
  outline: 'none',
  fontSize: 15,
  fontWeight: 500,
  color: duoColors.text,
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.8)',
};

export const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: 92,
  padding: '14px 15px',
  resize: 'none',
  lineHeight: 1.45,
};

export function getTypeLabel(
  type: DuoCard['type']
) {
  if (type === 'transport') {
    return 'Transport';
  }

  if (type === 'pay') {
    return 'Pay';
  }

  if (type === 'acquire') {
    return 'Acquire';
  }

  if (type === 'appointment') {
    return 'Appointment';
  }

  if (type === 'maintenance') {
    return 'Maintenance';
  }

  return type;
}

export function getTypeIcon(
  type: DuoCard['type']
) {
  if (type === 'transport') {
    return CarFront;
  }

  if (type === 'pay') {
    return CreditCard;
  }

  if (type === 'acquire') {
    return ShoppingBag;
  }

  if (type === 'appointment') {
    return Calendar;
  }

  if (type === 'maintenance') {
    return Wrench;
  }

  return CarFront;
}

export function getIconAccent(
  type: DuoCard['type']
) {
  if (type === 'transport') {
    return '#2f7df6';
  }

  if (type === 'pay') {
    return '#223047';
  }

  if (type === 'acquire') {
    return '#d97706';
  }

  if (type === 'appointment') {
    return '#2563eb';
  }

  if (type === 'maintenance') {
    return '#475569';
  }

  return '#2f7df6';
}

export function getStatusLabel(
  card: DuoCard,
  now = Date.now()
) {
  const isOverdue =
    (
      card.state === 'accepted' ||
      card.state === 'delayed'
    ) &&
    typeof card.dueAt === 'number' &&
    card.dueAt < now;

  if (isOverdue) {
    return 'Overdue';
  }

  if (card.state === 'requested') {
    return 'Requested';
  }

  if (card.state === 'accepted') {
    return 'Accepted';
  }

  if (card.state === 'delayed') {
    return 'Delayed';
  }

  if (card.state === 'done') {
    return 'Done';
  }

  if (card.state === 'cancelled') {
    return 'Cancelled';
  }

  if (card.state === 'stopped') {
    return 'Stopped';
  }

  if (card.state === 'expired') {
    return 'Expired';
  }

  return card.state;
}

export function getStatusStyle(
  card: DuoCard,
  now = Date.now()
) {
  const isOverdue =
    (
      card.state === 'accepted' ||
      card.state === 'delayed'
    ) &&
    typeof card.dueAt === 'number' &&
    card.dueAt < now;

  if (isOverdue) {
    return {
      background:
        'rgba(229, 57, 53, 0.1)',
      color: duoColors.red,
    };
  }

  if (card.state === 'requested') {
    return {
      background:
        'rgba(47, 125, 246, 0.11)',
      color: '#2563eb',
    };
  }

  if (card.state === 'accepted') {
    return {
      background:
        'rgba(22, 163, 106, 0.12)',
      color: duoColors.green,
    };
  }

  if (card.state === 'delayed') {
    return {
      background:
        'rgba(225, 132, 16, 0.13)',
      color: duoColors.amber,
    };
  }

  if (card.state === 'cancelled') {
    return {
      background:
        'rgba(229, 57, 53, 0.08)',
      color: duoColors.red,
    };
  }

  return {
    background:
      'rgba(100, 116, 139, 0.11)',
    color: duoColors.slate,
  };
}

export function formatDueAt(
  dueAt?: number
) {
  if (!dueAt) return '';

  const now =
    new Date();

  const date =
    new Date(dueAt);

  const today =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

  const targetDay =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

  const diffDays =
    Math.round(
      (
        targetDay.getTime() -
        today.getTime()
      ) /
        (1000 * 60 * 60 * 24)
    );

  const time =
    date.toLocaleTimeString(
      [],
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );

  if (diffDays === 0) {
    return `Today · ${time}`;
  }

  if (diffDays === 1) {
    return `Tomorrow · ${time}`;
  }

  if (diffDays === -1) {
    return `Yesterday · ${time}`;
  }

  return `${date.toLocaleDateString(
    [],
    {
      weekday: 'short',
    }
  )} · ${time}`;
}

export function IconTile({
  type,
  size = 64,
  iconSize = 28,
}: {
  type: DuoCard['type'];

  size?: number;

  iconSize?: number;
}) {
  const Icon =
    getTypeIcon(type);

  const accent =
    getIconAccent(type);

  return (
    <div
      style={{
        width: size,

        height: size,

        borderRadius:
          Math.round(size * 0.32),

        background:
          'linear-gradient(180deg, #ffffff 0%, #f2f5f9 100%)',

        border: `1px solid ${duoColors.borderSoft}`,

        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.95), 0 10px 24px rgba(31,41,55,0.075)',

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'center',

        color: accent,

        flexShrink: 0,

        position: 'relative',

        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',

          inset: 0,

          background:
            'radial-gradient(circle at 24% 14%, rgba(255,255,255,0.96), transparent 36%)',
        }}
      />

      <Icon
        size={iconSize}
        strokeWidth={2.15}
        style={{
          position: 'relative',

          filter:
            'drop-shadow(0 4px 5px rgba(31,41,55,0.13))',
        }}
      />
    </div>
  );
}