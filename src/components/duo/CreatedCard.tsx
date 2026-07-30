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

import {
  DuoCard,
} from '../../types/card';

import {
  getCardTitle,
  getCardContext,
} from '../../lib/cards';

type Props = {
  card: DuoCard;

  onOpen: (card: DuoCard) => void;
};

function getIcon(card: DuoCard) {
  if (card.type === 'transport') {
    return <CarFront size={28} />;
  }

  if (card.type === 'pay') {
    return <CreditCard size={28} />;
  }

  if (card.type === 'acquire') {
    return <ShoppingBag size={28} />;
  }

  if (card.type === 'appointment') {
    return <Calendar size={28} />;
  }

  if (card.type === 'maintenance') {
    return <Wrench size={28} />;
  }

  return null;
}

function getIconAccent(card: DuoCard) {
  if (card.type === 'transport') {
    return '#2f7df6';
  }

  if (card.type === 'pay') {
    return '#243142';
  }

  if (card.type === 'acquire') {
    return '#d97706';
  }

  if (card.type === 'appointment') {
    return '#2563eb';
  }

  if (card.type === 'maintenance') {
    return '#475569';
  }

  return '#2f7df6';
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

export default function CreatedCard({
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

  const isDelayed =
    card.state === 'delayed';

  const isOverdue =
    isActiveOverdue(
      card,
      now
    );

  const stateStyle =
    getStateStyle(
      card,
      now
    );

  const iconAccent =
    getIconAccent(card);

  return (
    <button
      onClick={() =>
        onOpen(card)
      }
      style={{
        width: '100%',

        minHeight: 98,

        boxSizing: 'border-box',

        padding: 12,

        borderRadius: 22,

        border:
          '1px solid rgba(24,32,44,0.07)',

        background:
          'rgba(255,255,255,0.88)',

        boxShadow:
          '0 14px 34px rgba(31,41,55,0.075)',

        textAlign: 'left',

        cursor: 'pointer',

        display: 'flex',

        alignItems: 'center',

        gap: 13,
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

          justifyContent: 'center',

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

        <div
          style={{
            position: 'relative',

            filter:
              'drop-shadow(0 4px 5px rgba(31,41,55,0.16))',
          }}
        >
          {getIcon(card)}
        </div>
      </div>

      <div
        style={{
          minWidth: 0,

          flex: 1,

          display: 'flex',

          flexDirection: 'column',

          gap: 5,
        }}
      >
        <div
          style={{
            display: 'flex',

            alignItems: 'center',

            justifyContent:
              'space-between',

            gap: 10,
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

              textOverflow: 'ellipsis',

              whiteSpace: 'nowrap',
            }}
          >
            {getCardTitle(card)}
          </div>

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

              flexShrink: 0,
            }}
          >
            {getStateLabel(
              card,
              now
            )}
          </div>
        </div>

        <div
          style={{
            fontSize: 13,

            color: '#6f7a89',

            lineHeight: 1.25,

            fontWeight: 620,

            overflow: 'hidden',

            textOverflow: 'ellipsis',

            whiteSpace: 'nowrap',
          }}
        >
          {getCardContext(card)}
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

              color:
                isOverdue
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

              textOverflow: 'ellipsis',

              whiteSpace: 'nowrap',
            }}
          >
            <Clock3 size={13} />

            {formatDueAt(
              card.dueAt
            )}
          </div>
        )}
      </div>
    </button>
  );
}