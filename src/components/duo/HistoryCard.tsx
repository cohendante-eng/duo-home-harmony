import {
  DuoCard,
} from '../../types/card';

import {
  getCardTitle,
  getCardContext,
} from '../../lib/cards';

type Props = {
  card: DuoCard;

  onOpen: (
    card: DuoCard
  ) => void;
};

function getStatusLabel(
  card: DuoCard
) {
  if (card.state === 'stopped') {
    return 'STOPPED';
  }

  if (card.state === 'cancelled') {
    return 'CANCELLED';
  }

  if (card.state === 'expired') {
    return 'EXPIRED';
  }

  return 'DONE';
}

function getStatusColor(
  card: DuoCard
) {
  if (card.state === 'expired') {
    return '#888';
  }

  if (card.state === 'cancelled') {
    return '#777';
  }

  if (card.state === 'stopped') {
    return '#666';
  }

  return '#777';
}

export default function HistoryCard({
  card,

  onOpen,
}: Props) {
  return (
    <button
      onClick={() =>
        onOpen(card)
      }
      style={{
        width: '100%',

        height: 88,

        boxSizing: 'border-box',

        padding: 16,

        borderRadius: 18,

        border:
          '1px solid rgba(0,0,0,0.06)',

        background: '#fff',

        display: 'flex',

        alignItems: 'flex-start',

        justifyContent:
          'space-between',

        gap: 14,

        cursor: 'pointer',

        textAlign: 'left',
      }}
    >
      <div
        style={{
          minWidth: 0,

          flex: 1,

          paddingTop: 1,
        }}
      >
        <div
          style={{
            fontSize: 16,

            fontWeight: 700,

            color: '#111',

            lineHeight: 1.16,

            letterSpacing: -0.05,

            overflow: 'hidden',

            textOverflow: 'ellipsis',

            whiteSpace: 'nowrap',
          }}
        >
          {getCardTitle(card)}
        </div>

        <div
          style={{
            marginTop: 8,

            fontSize: 13,

            color: '#888',

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

          height: 26,

          padding:
            '0 10px',

          borderRadius: 999,

          background:
            'rgba(0,0,0,0.035)',

          fontSize: 10,

          fontWeight: 800,

          letterSpacing: 0.55,

          color:
            getStatusColor(card),

          whiteSpace: 'nowrap',

          textTransform:
            'uppercase',
        }}
      >
        {getStatusLabel(card)}
      </div>
    </button>
  );
}