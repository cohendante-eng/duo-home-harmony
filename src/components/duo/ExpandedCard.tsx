import {
  Clock3,
  MoreHorizontal,
  X,
  CarFront,
  CreditCard,
  ShoppingBag,
  Calendar,
  Wrench,
} from 'lucide-react';

import { useState } from 'react';

import { useCards } from '../../store/useCards';

import {
  useAuth,
} from '../../hooks/useAuth';

import {
  usePartner,
} from '../../store/usePartner';

import {
  acceptSupabaseCard,
  cancelSupabaseCard,
  completeSupabaseCard,
  delaySupabaseCard,
  declineSupabaseCard,
} from '../../lib/supabaseCards';

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

function getTitle(card: any) {
  if ('title' in card.payload) {
    return card.payload.title;
  }

  if ('item' in card.payload) {
    return card.payload.item;
  }

  return '';
}

function getContext(card: any) {
  if (card.type === 'transport') {
    return `${card.payload.from || ''} → ${
      card.payload.to || ''
    }`;
  }

  if (card.type === 'pay') {
    return `${card.payload.amount || ''} → ${
      card.payload.recipient || ''
    }`;
  }

  if (card.type === 'acquire') {
    return `${card.payload.source || ''} · ${
      card.payload.quantity || ''
    }`;
  }

  if (card.type === 'appointment') {
    return card.payload.location || '';
  }

  if (card.type === 'maintenance') {
    return card.payload.location || '';
  }

  return '';
}

function getIcon(card: any) {
  if (card.type === 'transport') {
    return <CarFront size={26} />;
  }

  if (card.type === 'pay') {
    return <CreditCard size={26} />;
  }

  if (card.type === 'acquire') {
    return <ShoppingBag size={26} />;
  }

  if (card.type === 'appointment') {
    return <Calendar size={26} />;
  }

  if (card.type === 'maintenance') {
    return <Wrench size={26} />;
  }

  return null;
}

function getStateLabel(state: string) {
  if (state === 'requested') {
    return 'Requested';
  }

  if (state === 'accepted') {
    return 'Accepted';
  }

  if (state === 'delayed') {
    return 'Delayed';
  }

  return state;
}

function getStateColor(state: string) {
  if (state === 'delayed') {
    return '#a16207';
  }

  if (state === 'accepted') {
    return '#2e7d32';
  }

  return '#555';
}

function getStateBackground(state: string) {
  if (state === 'delayed') {
    return 'rgba(217, 119, 6, 0.12)';
  }

  if (state === 'accepted') {
    return 'rgba(52, 168, 83, 0.08)';
  }

  return 'rgba(0,0,0,0.06)';
}

export default function ExpandedCard({
  cardId,
  onClose,
}: Props) {
  const [showMenu, setShowMenu] =
    useState(false);

  const [showReschedule, setShowReschedule] =
    useState(false);

  const {
    user,
  } = useAuth();

  const partner =
    usePartner(
      (s) => s.partner
    );

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

  const title =
    getTitle(card);

  const context =
    getContext(card);

  function getRealUserId(
    localId: 'me' | 'partner'
  ) {
    if (localId === 'me') {
      return user?.id;
    }

    return partner?.id;
  }

  function handleAccept() {
    acceptCard(card.id);

    acceptSupabaseCard({
      cardId: card.id,
    }).catch((error) => {
      console.error(
        'Could not accept Supabase card',
        error
      );
    });

    onClose();
  }

  function handleDone() {
    completeCard(card.id);

    completeSupabaseCard({
      cardId: card.id,
    }).catch((error) => {
      console.error(
        'Could not complete Supabase card',
        error
      );
    });

    onClose();
  }

  function handleCancel() {
    cancelCard(card.id);

    cancelSupabaseCard({
      cardId: card.id,
    }).catch((error) => {
      console.error(
        'Could not cancel Supabase card',
        error
      );
    });

    onClose();
  }

  function handleDecline() {
    const currentCount =
      typeof card.blockCount ===
      'number'
        ? card.blockCount
        : 0;

    const nextBlockCount =
      currentCount + 1;

    const newOwner =
      card.ownerId === 'me'
        ? 'partner'
        : 'me';

    blockCard(card.id);

    declineSupabaseCard({
      cardId: card.id,

      newOwnerId:
        getRealUserId(newOwner),

      nextBlockCount,
    }).catch((error) => {
      console.error(
        'Could not decline Supabase card',
        error
      );
    });

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
    const ms =
      1000 *
      60 *
      minutes;

    const baseTime =
      typeof card.dueAt ===
      'number'
        ? card.dueAt
        : Date.now();

    const nextDueAt =
      baseTime + ms;

    delayCard(
      card.id,
      ms
    );

    delaySupabaseCard({
      cardId: card.id,

      dueAt:
        nextDueAt,

      modifierForId:
        getRealUserId(
          card.creatorId
        ),
    }).catch((error) => {
      console.error(
        'Could not delay Supabase card',
        error
      );
    });

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

        paddingBottom: 100,

        display: 'flex',

        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',

          justifyContent:
            'space-between',

          alignItems:
            'center',

          marginBottom: 34,
        }}
      >
        <div
          style={{
            display: 'flex',

            alignItems: 'center',

            gap: 14,
          }}
        >
          <div
            style={{
              width: 52,

              height: 52,

              borderRadius: 17,

              background:
                'rgba(0,0,0,0.04)',

              display: 'flex',

              alignItems:
                'center',

              justifyContent:
                'center',

              color: '#444',
            }}
          >
            {getIcon(card)}
          </div>

          <div>
            <div
              style={{
                fontSize: 13,

                color: '#999',

                fontWeight: 650,

                textTransform:
                  'capitalize',

                marginBottom: 3,
              }}
            >
              {card.type}
            </div>

            <div
              style={{
                display:
                  'inline-flex',

                alignItems:
                  'center',

                height: 24,

                padding:
                  '0 10px',

                borderRadius: 999,

                background:
                  getStateBackground(
                    card.state
                  ),

                color:
                  getStateColor(
                    card.state
                  ),

                fontSize: 10,

                fontWeight: 800,

                letterSpacing: 0.35,

                textTransform:
                  'uppercase',
              }}
            >
              {getStateLabel(
                card.state
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',

            alignItems: 'center',

            gap: 10,

            position: 'relative',
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
                width: 40,

                height: 40,

                borderRadius: 999,

                border:
                  '1px solid rgba(0,0,0,0.06)',

                background: '#fff',

                display: 'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                cursor: 'pointer',
              }}
            >
              <MoreHorizontal
                size={19}
              />
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              width: 40,

              height: 40,

              borderRadius: 999,

              border:
                '1px solid rgba(0,0,0,0.06)',

              background: '#fff',

              display: 'flex',

              alignItems:
                'center',

              justifyContent:
                'center',

              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>

          {showMenu && (
            <div
              style={{
                position:
                  'absolute',

                top: 48,

                right: 48,

                width: 220,

                borderRadius: 16,

                border:
                  '1px solid rgba(0,0,0,0.06)',

                background: '#fff',

                boxShadow:
                  '0 12px 36px rgba(0,0,0,0.1)',

                overflow: 'hidden',

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
                      width: '100%',

                      height: 48,

                      border: 'none',

                      background: '#fff',

                      textAlign: 'left',

                      padding:
                        '0 16px',

                      fontWeight: 600,

                      cursor: 'pointer',
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
                      width: '100%',

                      height: 44,

                      border: 'none',

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
                      width: '100%',

                      height: 44,

                      border: 'none',

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
                      width: '100%',

                      height: 44,

                      border: 'none',

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
                    width: '100%',

                    height: 48,

                    border: 'none',

                    background: '#fff',

                    textAlign: 'left',

                    padding:
                      '0 16px',

                    fontWeight: 600,

                    cursor: 'pointer',
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
                    width: '100%',

                    height: 48,

                    border: 'none',

                    background: '#fff',

                    textAlign: 'left',

                    padding:
                      '0 16px',

                    color: '#777',

                    fontWeight: 600,

                    cursor: 'pointer',
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
                    width: '100%',

                    height: 48,

                    border: 'none',

                    background: '#fff',

                    textAlign: 'left',

                    padding:
                      '0 16px',

                    color: '#777',

                    fontWeight: 600,

                    cursor: 'pointer',
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
          marginTop: 10,
        }}
      >
        <div
          style={{
            fontSize: 30,

            fontWeight: 780,

            letterSpacing: -0.5,

            color: '#111',

            lineHeight: 1.1,

            marginBottom: 10,
          }}
        >
          {title}
        </div>

        {context && (
          <div
            style={{
              fontSize: 17,

              color: '#777',

              lineHeight: 1.35,

              fontWeight: 500,

              marginBottom: 26,
            }}
          >
            {context}
          </div>
        )}

        {card.dueAt && (
          <div
            style={{
              display: 'inline-flex',

              alignItems: 'center',

              gap: 8,

              padding:
                '10px 12px',

              borderRadius: 999,

              background:
                isDelayed
                  ? 'rgba(217, 119, 6, 0.1)'
                  : 'rgba(0,0,0,0.045)',

              color: isDelayed
                ? '#a16207'
                : '#555',

              fontSize: 14,

              fontWeight: 700,
            }}
          >
            <Clock3 size={16} />

            {formatDueAt(card.dueAt)}
          </div>
        )}
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

              height: 58,

              borderRadius: 18,

              border: 'none',

              background: '#111',

              color: '#fff',

              fontSize: 16,

              fontWeight: 750,

              cursor: 'pointer',
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

                height: 58,

                borderRadius: 18,

                border: 'none',

                background: '#111',

                color: '#fff',

                fontSize: 16,

                fontWeight: 750,

                cursor: 'pointer',
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

                height: 58,

                borderRadius: 18,

                border: 'none',

                background: '#111',

                color: '#fff',

                fontSize: 16,

                fontWeight: 750,

                cursor: 'pointer',
              }}
            >
              Done
            </button>
          )}
      </div>
    </div>
  );
}