import {
  Clock3,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import { DuoCard } from '../../types/card';

import { useCards } from '../../store/useCards';

import {
  IconTile,
  duoColors,
  formatDueAt,
  getStatusLabel,
  getStatusStyle,
} from '../../styles/ui';

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

  const stateStyle =
    getStatusStyle(
      card,
      now
    );

  return (
    <button
      onClick={() => onOpen(card)}
      style={{
        width: '100%',
        minHeight: 100,
        border:
          '1px solid rgba(24,32,44,0.075)',
        borderRadius: 24,
        padding: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        background:
          'rgba(255,255,255,0.9)',
        boxShadow:
          '0 16px 40px rgba(31,41,55,0.08)',
        textAlign: 'left',
        cursor: 'pointer',
        opacity: isMine ? 1 : 0.58,
        transition:
          'transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease',
      }}
    >
      <IconTile
        type={card.type}
        size={66}
        iconSize={30}
      />

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
                textOverflow:
                  'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </div>

            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: duoColors.muted,
                lineHeight: 1.25,
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow:
                  'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {subtitle}
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 25,
              padding: '0 10px',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 650,
              letterSpacing: 0.1,
              background:
                stateStyle.background,
              color: stateStyle.color,
              flexShrink: 0,
            }}
          >
            {getStatusLabel(
              card,
              now
            )}
          </div>
        </div>

        {card.dueAt && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 5,
              fontSize: 12,
              color: isOverdue
                ? duoColors.red
                : isDelayed
                ? duoColors.amber
                : duoColors.muted,
              fontWeight:
                isOverdue || isDelayed
                  ? 650
                  : 500,
              overflow: 'hidden',
              textOverflow:
                'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <Clock3
              size={13}
              strokeWidth={2}
            />

            {formatDueAt(
              card.dueAt
            )}
          </div>
        )}
      </div>
    </button>
  );
}