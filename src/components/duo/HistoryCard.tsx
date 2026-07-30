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

import {
  duoColors,
  getStatusStyle,
} from '../../styles/ui';

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

  const statusStyle =
    getStatusStyle(card);

  return (
    <button
      onClick={() => {
        if (onOpen) {
          onOpen(card);
        }
      }}
      style={{
        width: '100%',
        minHeight: 90,
        padding: 14,
        borderRadius: 24,
        border:
          '1px solid rgba(24,32,44,0.075)',
        background:
          'rgba(255,255,255,0.9)',
        boxShadow:
          '0 14px 36px rgba(31,41,55,0.065)',
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
            fontWeight: 650,
            color: duoColors.text,
            lineHeight: 1.18,
            letterSpacing: -0.18,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {getCardTitle(card)}
        </div>

        <div
          style={{
            marginTop: 7,
            fontSize: 13,
            color: duoColors.muted,
            lineHeight: 1.25,
            fontWeight: 500,
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
          padding: '0 10px',
          borderRadius: 999,
          background:
            statusStyle.background,
          fontSize: 10,
          fontWeight: 650,
          letterSpacing: 0.1,
          color: statusStyle.color,
          whiteSpace: 'nowrap',
        }}
      >
        <StatusIcon
          size={13}
          strokeWidth={2.2}
        />

        {getStatusLabel(card)}
      </div>
    </button>
  );
}