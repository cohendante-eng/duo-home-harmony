import {
  Clock3,
  MoreHorizontal,
} from 'lucide-react';

import { useState } from 'react';

import { useCards } from '../../store/useCards';

type Props = {
  cardId: string;

  onClose: () => void;
};

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

export default function ExpandedCard({
  cardId,
  onClose,
}: Props) {
  const [showMenu, setShowMenu] =
    useState(false);

  const [showReschedule, setShowReschedule] =
    useState(false);

  const card =
    useCards((s) =>
      s.activeCards.find(
        (c) => c.id === cardId
      )
    );

  const currentUser =
    useCards((s) => s.currentUser);

  const acceptCard =
    useCards((s) => s.acceptCard);

  const completeCard =
    useCards((s) => s.completeCard);

  const cancelCard =
    useCards((s) => s.cancelCard);

  const delayCard =
    useCards((s) => s.delayCard);

  const blockCard =
    useCards((s) => s.blockCard);

  const stopCard =
    useCards((s) => s.stopCard);

  const takeCard =
    useCards((s) => s.takeCard);

  if (!card) return null;

  const isOwner =
    card.ownerId === currentUser;

  const isCreator =
    card.creatorId === currentUser;

  const isRequested =
    card.state === 'requested';

  const isAccepted =
    card.state === 'accepted' ||
    card.state === 'delayed';

  const isDelayed =
    card.state === 'delayed';

  const isSurfaced =
    !isOwner &&
    card.modifierFor ===
      currentUser;

  const blockCount =
    typeof card.blockCount ===
    'number'
      ? card.blockCount
      : 0;

  const canStop =
    isCreator &&
    blockCount >= 2;

  function handleAccept() {
    acceptCard(card.id);

    onClose();
  }

  function handleDone() {
    completeCard(card.id);

    onClose();
  }

  function handleCancel() {
    cancelCard(card.id);

    onClose();
  }

  function handleDecline() {
    blockCard(card.id);

    onClose();
  }

  function handleStop() {
    stopCard(card.id);

    onClose();
  }

  function handleTake() {
    takeCard(card.id);

    onClose();
  }

  function handleReschedule(
    minutes: number
  ) {
    delayCard(
      card.id,
      1000 *
        60 *
        minutes
    );

    setShowMenu(false);

    setShowReschedule(false);

    onClose();
  }

  return (
    <div
      style={{
        position: 'fixed',

        inset: 0,

        background: '#fff',

        zIndex: 100,

        padding: 24,

        display: 'flex',

        flexDirection:
          'column',
      }}
    >
      <div
        style={{
          display: 'flex',

          justifyContent:
            'space-between',

          alignItems:
            'flex-start',

          marginBottom: 32,
        }}
      >
        <div
          style={{
            fontSize: 28,

            fontWeight: 700,

            textTransform:
              'capitalize',
          }}
        >
          {card.type}
        </div>

        <div
          style={{
            display: 'flex',

            alignItems:
              'center',

            gap: 10,

            position:
              'relative',
          }}
        >
          {(isOwner ||
            canStop) && (
            <button
              onClick={() =>
                setShowMenu(
                  !showMenu
                )
              }
              style={{
                width: 36,

                height: 36,

                borderRadius:
                  999,

                border:
                  '1px solid rgba(0,0,0,0.06)',

                background:
                  '#fff',

                display: 'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                cursor:
                  'pointer',
              }}
            >
              <MoreHorizontal
                size={18}
              />
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              border: 'none',

              background:
                'none',

              cursor:
                'pointer',
            }}
          >
            Close
          </button>

          {showMenu && (
            <div
              style={{
                position:
                  'absolute',

                top: 44,

                right: 52,

                width: 220,

                borderRadius:
                  14,

                border:
                  '1px solid rgba(0,0,0,0.06)',

                background:
                  '#fff',

                boxShadow:
                  '0 8px 30px rgba(0,0,0,0.08)',

                overflow:
                  'hidden',

                zIndex: 200,
              }}
            >
              {isOwner &&
                isAccepted && (
                  <button
                    onClick={() => {
                      setShowReschedule(
                        !showReschedule
                      );
                    }}
                    style={{
                      width:
                        '100%',

                      height: 48,

                      border:
                        'none',

                      background:
                        '#fff',

                      textAlign:
                        'left',

                      padding:
                        '0 16px',

                      fontWeight: 500,

                      cursor:
                        'pointer',
                    }}
                  >
                    Reschedule
                  </button>
                )}

              {showReschedule && (
                <div
                  style={{
                    borderTop:
                      '1px solid rgba(0,0,0,0.05)',

                    borderBottom:
                      '1px solid rgba(0,0,0,0.05)',

                    background:
                      '#fafafa',
                  }}
                >
                  <button
                    onClick={() =>
                      handleReschedule(
                        30
                      )
                    }
                    style={{
                      width:
                        '100%',

                      height: 44,

                      border:
                        'none',

                      background:
                        'transparent',

                      textAlign:
                        'left',

                      padding:
                        '0 16px',

                      cursor:
                        'pointer',
                    }}
                  >
                    +30 minutes
                  </button>

                  <button
                    onClick={() =>
                      handleReschedule(
                        60
                      )
                    }
                    style={{
                      width:
                        '100%',

                      height: 44,

                      border:
                        'none',

                      background:
                        'transparent',

                      textAlign:
                        'left',

                      padding:
                        '0 16px',

                      cursor:
                        'pointer',
                    }}
                  >
                    +1 hour
                  </button>

                  <button
                    onClick={() =>
                      handleReschedule(
                        180
                      )
                    }
                    style={{
                      width:
                        '100%',

                      height: 44,

                      border:
                        'none',

                      background:
                        'transparent',

                      textAlign:
                        'left',

                      padding:
                        '0 16px',

                      cursor:
                        'pointer',
                    }}
                  >
                    +3 hours
                  </button>
                </div>
              )}

              {isOwner && (
                <button
                  onClick={
                    handleDecline
                  }
                  style={{
                    width:
                      '100%',

                    height: 48,

                    border:
                      'none',

                    background:
                      '#fff',

                    textAlign:
                      'left',

                    padding:
                      '0 16px',

                    fontWeight: 500,

                    cursor:
                      'pointer',
                  }}
                >
                  Decline
                </button>
              )}

              {canStop && (
                <button
                  onClick={
                    handleStop
                  }
                  style={{
                    width:
                      '100%',

                    height: 48,

                    border:
                      'none',

                    background:
                      '#fff',

                    textAlign:
                      'left',

                    padding:
                      '0 16px',

                    color:
                      '#777',

                    fontWeight: 500,

                    cursor:
                      'pointer',
                  }}
                >
                  Stop
                </button>
              )}

              {isOwner && (
                <button
                  onClick={
                    handleCancel
                  }
                  style={{
                    width:
                      '100%',

                    height: 48,

                    border:
                      'none',

                    background:
                      '#fff',

                    textAlign:
                      'left',

                    padding:
                      '0 16px',

                    color:
                      '#777',

                    fontWeight: 500,

                    cursor:
                      'pointer',
                  }}
                >
                  Cancel Task
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',

          flexDirection:
            'column',

          gap: 22,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,

              opacity: 0.45,

              marginBottom: 6,
            }}
          >
            TITLE
          </div>

          <div
            style={{
              fontSize: 22,

              fontWeight: 600,
            }}
          >
            {'title' in
            card.payload
              ? card.payload.title
              : card.payload.item}
          </div>
        </div>

        {card.dueAt && (
          <div>
            <div
              style={{
                fontSize: 13,

                opacity: 0.45,

                marginBottom: 6,
              }}
            >
              TIME
            </div>

            <div
              style={{
                display:
                  'inline-flex',

                alignItems:
                  'center',

                gap: 8,

                fontSize: 15,

                fontWeight: 500,

                color:
                  isDelayed
                    ? '#a16207'
                    : '#111',
              }}
            >
              <Clock3
                size={16}
              />

              {formatDueAt(
                card.dueAt
              )}
            </div>
          </div>
        )}

        <div>
          <div
            style={{
              fontSize: 13,

              opacity: 0.45,

              marginBottom: 6,
            }}
          >
            STATUS
          </div>

          <div
            style={{
              textTransform:
                'capitalize',
            }}
          >
            {card.state}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 'auto',
        }}
      >
        {isSurfaced && (
          <button
            onClick={handleTake}
            style={{
              width: '100%',

              height: 56,

              borderRadius: 14,

              border: 'none',

              background:
                '#111',

              color: '#fff',

              fontSize: 16,

              fontWeight: 600,
            }}
          >
            Take
          </button>
        )}

        {isOwner &&
          isRequested && (
            <button
              onClick={
                handleAccept
              }
              style={{
                width: '100%',

                height: 56,

                borderRadius: 14,

                border: 'none',

                background:
                  '#111',

                color: '#fff',

                fontSize: 16,

                fontWeight: 600,
              }}
            >
              Accept
            </button>
          )}

        {isOwner &&
          isAccepted && (
            <button
              onClick={handleDone}
              style={{
                width: '100%',

                height: 56,

                borderRadius: 14,

                border: 'none',

                background:
                  '#111',

                color: '#fff',

                fontSize: 16,

                fontWeight: 600,
              }}
            >
              Done
            </button>
          )}
      </div>
    </div>
  );
}