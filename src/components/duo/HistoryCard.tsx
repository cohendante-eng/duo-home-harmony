import {
  CheckCircle2,
  XCircle,
  TimerOff,
  CircleStop,
} from 'lucide-react';

import {
  DuoCard,
} from '../../types/card';

import {
  getCardTitle,
  getCardContext,
} from '../../lib/cards';

type Props = {
  card: DuoCard;

  onOpen?: (
    card: DuoCard
  ) => void;
};

function getStatusLabel(
  card: DuoCard
) {
  if (card.state === 'stopped') {
    return 'Stopped';
  }

  if (card.state === 'cancelled') {
    return 'Cancelled';
  }

  if (card.state === 'expired') {
    return 'Expired';
  }

  return 'Done';
}

function getStatusColor(
  card: DuoCard
) {
  if (card.state === 'expired') {
    return '#64748b';
  }

  if (card.state === 'cancelled') {
    return '#ef4444';
  }

  if (card.state === 'stopped') {
    return '#64748b';
  }

  return '#059669';
}

function getStatusBackground(
  card: DuoCard
) {
  if (card.state === 'expired') {
    return 'rgba(100,116,139,0.11)';
  }

  if (card.state === 'cancelled') {
    return 'rgba(239,68,68,0.1)';
  }

  if (card.state === 'stopped') {
    return 'rgba(100,116,139,0.11)';
  }

  return 'rgba(16,185,129,0.12)';
}

function getStatusIcon(
  card: DuoCard
) {
  if (card.state === 'expired') {
    return TimerOff;
  }

  if (card.state === 'cancelled') {
    return XCircle;
  }

  if (card.state === 'stopped') {
    return CircleStop;
  }

  return CheckCircle2;
}

export default function HistoryCard({
  card,

  onOpen,
}: Props) {
  const StatusIcon =
    getStatusIcon(card);

  return (
    <button
      onClick={() => {
        if (onOpen) {
          onOpen(card);
        }
      }}
      style={{
        width: '100%',

        minHeight: 88,

        boxSizing: 'border-box',

        padding: 12,

        borderRadius: 22,

        border:
          '1px solid rgba(24,32,44,0.07)',

        background:
          'rgba(255,255,255,0.88)',

        boxShadow:
          '0 14px 34px rgba(31,41,55,0.065)',

        display: 'flex',

        alignItems: 'center',

        justifyContent:
          'space-between',

        gap: 14,

        cursor: onOpen
          ? 'pointer'
          : 'default',

        textAlign: 'left',
      }}
    >
      <div
        style={{
          minWidth: 0,

          flex: 1,
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
            marginTop: 6,

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
      </div>

      <div
        style={{
          flexShrink: 0,

          display: 'inline-flex',

          alignItems: 'center',

          gap: 6,

          height: 28,

          padding:
            '0 10px',

          borderRadius: 999,

          background:
            getStatusBackground(card),

          fontSize: 10,

          fontWeight: 850,

          letterSpacing: 0.15,

          color:
            getStatusColor(card),

          whiteSpace: 'nowrap',
        }}
      >
        <StatusIcon
          size={13}
          strokeWidth={2.4}
        />

        {getStatusLabel(card)}
      </div>
    </button>
  );
}