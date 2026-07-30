import {
  CarFront,
  CreditCard,
  ShoppingBag,
  Calendar,
  Wrench,
  Clock3,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import { DuoCard } from '../../types/card';

import { useCards } from '../../store/useCards';

type Props = {
  card: DuoCard;

  onOpen: (card: DuoCard) => void;
};

function getTitle(card: DuoCard) {
  switch (card.type) {
    case 'transport':
      return card.payload.title;

    case 'pay':
      return card.payload.title;

    case 'acquire':
      return card.payload.item;

    case 'appointment':
      return card.payload.title;

    case 'maintenance':
      return card.payload.title;

    default:
      return '';
  }
}

function getSubtitle(card: DuoCard) {
  switch (card.type) {
    case 'transport':
      return `${card.payload.from || ''} → ${
        card.payload.to || ''
      }`;

    case 'pay':
      return `${card.payload.amount || ''} → ${
        card.payload.recipient || ''
      }`;

    case 'acquire':
      return `${card.payload.source || ''} · ${
        card.payload.quantity || ''
      }`;

    case 'appointment':
      return `${card.payload.location || ''}`;

    case 'maintenance':
      return `${card.payload.location || ''}`;

    default:
      return '';
  }
}

function getIcon(card: DuoCard) {
  switch (card.type) {
    case 'transport':
      return CarFront;

    case 'pay':
      return CreditCard;

    case 'acquire':
      return ShoppingBag;

    case 'appointment':
      return Calendar;

    case 'maintenance':
      return Wrench;

    default:
      return CarFront;
  }
}

function getIconAccent(card: DuoCard) {
  switch (card.type) {
    case 'transport':
      return '#2f7df6';

    case 'pay':
      return '#243142';

    case 'acquire':
      return '#d97706';

    case 'appointment':
      return '#2563eb';

    case 'maintenance':
      return '#475569';

    default:
      return '#2f7df6';
  }
}

function isActiveOverdue(
  card: DuoCard,
  now: number
) {
  return (
    (
      card.state === 'accepted' ||
      card.state === 'delayed'
    ) &&
    typeof card.dueAt === 'number' &&
    card.dueAt < now
  );
}

function getStateLabel(
  card: DuoCard,
  now: number
) {
  if (isActiveOverdue(card, now)) {
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

  return card.state;
}

function getStateStyle(
  card: DuoCard,
  now: number
) {
  if (isActiveOverdue(card, now)) {
    return {
      background:
        'rgba(239, 68, 68, 0.1)',

      color: '#dc2626',
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
        'rgba(16, 185, 129, 0.12)',

      color: '#059669',
    };
  }

  if (card.state === 'delayed') {
    return {
      background:
        'rgba(245, 158, 11, 0.13)',

      color: '#d97706',
    };
  }

  return {
    background:
      'rgba(24,32,44,0.06)',

    color: '#64748b',
  };
}

function formatDueAt(
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
        (1000 *
          60 *
          60 *
          24)
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

export default function ResponsibilityCard({
  card,
  onOpen,
}: Props) {
  const [now, setNow] =
    useState(() => Date.now());

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        setNow(Date.now());
      }, 1000 * 30);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, []);

  const currentUser =
    useCards((s) => s.currentUser);

  const isMine =
    card.ownerId === currentUser;

  const isDelayed =
    card.state === 'delayed';

  const isOverdue =
    isActiveOverdue(
      card,
      now
    );

  const title =
    getTitle(card);

  const subtitle =
    getSubtitle(card);

  const Icon =
    getIcon(card);

  const iconAccent =
    getIconAccent(card);

  const stateStyle =
    getStateStyle(
      card,
      now
    );

  return (
    <button
      onClick={() => onOpen(card)}
      style={{
        width: '100%',

        minHeight: 98,

        boxSizing: 'border-box',

        border:
          '1px solid rgba(24,32,44,0.07)',

        borderRadius: 22,

        padding: 12,

        display: 'flex',

        alignItems: 'center',

        justifyContent:
          'space-between',

        gap: 13,

        background:
          'rgba(255,255,255,0.88)',

        boxShadow:
          '0 14px 34px rgba(31,41,55,0.075)',

        textAlign: 'left',

        cursor: 'pointer',

        opacity: isMine
          ? 1
          : 0.58,

        transition:
          'transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease',
      }}
    >
      <div
        style={{
          display: 'flex',

          alignItems: 'center',

          gap: 13,

          minWidth: 0,

          flex: 1,
        }}
      >
        <div
          style={{
            width: 64,

            height: 64,

            borderRadius: 20,

            background:
              'linear-gradient(180deg, #ffffff 0%, #f1f4f8 100%)',

            border:
              '1px solid rgba(24,32,44,0.06)',

            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 20px rgba(31,41,55,0.07)',

            display: 'flex',

            alignItems: 'center',

            justifyContent:
              'center',

            color: iconAccent,

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
                'radial-gradient(circle at 25% 15%, rgba(255,255,255,0.95), transparent 34%)',
            }}
          />

          <Icon
            size={30}
            strokeWidth={2.25}
            style={{
              position: 'relative',

              filter:
                'drop-shadow(0 4px 5px rgba(31,41,55,0.16))',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',

            flexDirection:
              'column',

            gap: 4,

            minWidth: 0,

            flex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',

              alignItems:
                'flex-start',

              justifyContent:
                'space-between',

              gap: 10,
            }}
          >
            <div
              style={{
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: 16,

                  fontWeight: 820,

                  color: '#18202c',

                  lineHeight: 1.15,

                  letterSpacing: -0.2,

                  overflow: 'hidden',

                  textOverflow:
                    'ellipsis',

                  whiteSpace:
                    'nowrap',
                }}
              >
                {title}
              </div>

              <div
                style={{
                  marginTop: 3,

                  fontSize: 13,

                  color: '#6f7a89',

                  lineHeight: 1.25,

                  fontWeight: 620,

                  overflow: 'hidden',

                  textOverflow:
                    'ellipsis',

                  whiteSpace:
                    'nowrap',
                }}
              >
                {subtitle}
              </div>
            </div>
          </div>

          {card.dueAt && (
            <div
              style={{
                display:
                  'inline-flex',

                alignItems:
                  'center',

                gap: 6,

                marginTop: 5,

                fontSize: 12,

                color: isOverdue
                  ? '#dc2626'
                  : isDelayed
                  ? '#d97706'
                  : '#7c8795',

                fontWeight:
                  isOverdue ||
                  isDelayed
                    ? 750
                    : 650,

                overflow: 'hidden',

                textOverflow:
                  'ellipsis',

                whiteSpace: 'nowrap',
              }}
            >
              <Clock3
                size={13}
                strokeWidth={2.25}
              />

              {formatDueAt(
                card.dueAt
              )}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          flexShrink: 0,

          alignSelf: 'flex-start',

          paddingTop: 3,
        }}
      >
        <div
          style={{
            display: 'inline-flex',

            alignItems: 'center',

            height: 25,

            padding:
              '0 10px',

            borderRadius: 999,

            fontSize: 10,

            fontWeight: 850,

            letterSpacing: 0.15,

            background:
              stateStyle.background,

            color:
              stateStyle.color,
          }}
        >
          {getStateLabel(
            card,
            now
          )}
        </div>
      </div>
    </button>
  );
}