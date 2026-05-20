import {
  CarFront,
  CreditCard,
  ShoppingBag,
  Calendar,
  Wrench,
  Clock3,
} from 'lucide-react';

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

function getStateLabel(card: DuoCard) {
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
  const currentUser =
    useCards((s) => s.currentUser);

  const isMine =
    card.ownerId === currentUser;

  const isRequested =
    card.state === 'requested';

  const isAccepted =
    card.state === 'accepted';

  const isDelayed =
    card.state === 'delayed';

  const title =
    getTitle(card);

  const subtitle =
    getSubtitle(card);

  const Icon =
    getIcon(card);

  return (
    <button
      onClick={() => onOpen(card)}
      style={{
        width: '100%',

        height: 88,

        boxSizing: 'border-box',

        border:
          '1px solid rgba(0,0,0,0.065)',

        borderRadius: 18,

        padding: 16,

        display: 'flex',

        alignItems: 'flex-start',

        justifyContent:
          'space-between',

        gap: 14,

        background:
          isMine
            ? '#fbfbfa'
            : '#fff',

        textAlign: 'left',

        cursor: 'pointer',

        opacity: isMine
          ? 1
          : 0.42,

        transition:
          'opacity 0.2s ease, background 0.2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',

          alignItems: 'flex-start',

          gap: 13,

          minWidth: 0,

          flex: 1,
        }}
      >
        <div
          style={{
            width: 46,

            height: 46,

            borderRadius: 15,

            background:
              'rgba(0,0,0,0.055)',

            display: 'flex',

            alignItems: 'center',

            justifyContent:
              'center',

            color: '#444',

            flexShrink: 0,
          }}
        >
          <Icon size={23} />
        </div>

        <div
          style={{
            display: 'flex',

            flexDirection:
              'column',

            gap: 4,

            minWidth: 0,

            paddingTop: 1,
          }}
        >
          <div
            style={{
              fontSize: 17,

              fontWeight: 760,

              color: '#111',

              lineHeight: 1.14,

              letterSpacing: -0.1,

              overflow: 'hidden',

              textOverflow: 'ellipsis',

              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: 14,

              color: '#666',

              lineHeight: 1.25,

              fontWeight: 550,

              overflow: 'hidden',

              textOverflow: 'ellipsis',

              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
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

                color: isDelayed
                  ? '#a16207'
                  : '#666',

                fontWeight:
                  isDelayed
                    ? 700
                    : 600,

                overflow: 'hidden',

                textOverflow: 'ellipsis',

                whiteSpace: 'nowrap',
              }}
            >
              <Clock3
                size={13}
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

          paddingTop: 1,
        }}
      >
        <div
          style={{
            display: 'inline-flex',

            alignItems: 'center',

            height: 26,

            padding:
              '0 11px',

            borderRadius: 999,

            fontSize: 10,

            fontWeight: 800,

            letterSpacing: 0.35,

            textTransform:
              'uppercase',

            background:
              isDelayed
                ? 'rgba(217, 119, 6, 0.12)'
                : isRequested
                ? 'rgba(0,0,0,0.06)'
                : 'rgba(34, 197, 94, 0.14)',

            color:
              isDelayed
                ? '#a16207'
                : isRequested
                ? '#555'
                : '#15803d',

            border:
              isAccepted
                ? '1px solid rgba(34, 197, 94, 0.28)'
                : isDelayed
                ? '1px solid rgba(217, 119, 6, 0.14)'
                : 'none',
          }}
        >
          {getStateLabel(card)}
        </div>
      </div>
    </button>
  );
}