import {
  DuoCard,
} from '../../types/card';

import {
  getCardTitle,
  getCardContext,
} from '../../lib/cards';

type Props = {
  card: DuoCard;
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
    return '#999';
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
}: Props) {
  return (
    <div
      style={{
        padding: 16,

        borderRadius: 18,

        border:
          '1px solid rgba(0,0,0,0.06)',

        background: '#fff',

        display: 'flex',

        flexDirection:
          'column',

        gap: 7,
      }}
    >
      <div
        style={{
          display: 'flex',

          justifyContent:
            'space-between',

          alignItems:
            'flex-start',

          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 15,

              fontWeight: 650,

              color: '#111',
            }}
          >
            {getCardTitle(card)}
          </div>

          <div
            style={{
              marginTop: 7,

              fontSize: 13,

              color: '#888',
            }}
          >
            {getCardContext(card)}
          </div>
        </div>

        <div
          style={{
            padding:
              '6px 9px',

            borderRadius: 999,

            background:
              'rgba(0,0,0,0.035)',

            fontSize: 10,

            fontWeight: 750,

            letterSpacing: 0.6,

            color:
              getStatusColor(card),

            whiteSpace:
              'nowrap',
          }}
        >
          {getStatusLabel(card)}
        </div>
      </div>
    </div>
  );
}