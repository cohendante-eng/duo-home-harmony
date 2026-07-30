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

import {
  useEffect,
  useState,
} from 'react';

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
  removeSupabaseCard,
  stopSupabaseCard,
  takeSupabaseCard,
} from '../../lib/supabaseCards';

type Props = {
  cardId: string;

  onClose: () => void;
};

type DetailRow = {
  label: string;

  value: string;
};

function isActiveOverdue(
  card: any,
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

function cleanValue(value: unknown) {
  if (
    value === undefined ||
    value === null
  ) {
    return '';
  }

  return String(value).trim();
}

function getDetailRows(
  card: any
): DetailRow[] {
  const payload =
    card.payload || {};

  const rows: DetailRow[] = [];

  function addRow(
    label: string,
    value: unknown
  ) {
    const clean =
      cleanValue(value);

    if (!clean) return;

    rows.push({
      label,
      value: clean,
    });
  }

  if (card.type === 'transport') {
    addRow(
      'Task',
      payload.title
    );

    addRow(
      'From',
      payload.from
    );

    addRow(
      'To',
      payload.to
    );

    return rows;
  }

  if (card.type === 'pay') {
    addRow(
      'Payment',
      payload.title
    );

    addRow(
      'Amount',
      payload.amount
    );

    addRow(
      'Recipient',
      payload.recipient
    );

    return rows;
  }

  if (card.type === 'acquire') {
    addRow(
      'Item',
      payload.item
    );

    addRow(
      'From',
      payload.source
    );

    addRow(
      'Quantity',
      payload.quantity
    );

    return rows;
  }

  if (card.type === 'appointment') {
    addRow(
      'Appointment',
      payload.title
    );

    addRow(
      'Location',
      payload.location
    );

    return rows;
  }

  if (card.type === 'maintenance') {
    addRow(
      'Task',
      payload.title
    );

    addRow(
      'Location',
      payload.location
    );

    return rows;
  }

  return rows;
}

function getIcon(card: any) {
  if (card.type === 'transport') {
    return <CarFront size={30} />;
  }

  if (card.type === 'pay') {
    return <CreditCard size={30} />;
  }

  if (card.type === 'acquire') {
    return <ShoppingBag size={30} />;
  }

  if (card.type === 'appointment') {
    return <Calendar size={30} />;
  }

  if (card.type === 'maintenance') {
    return <Wrench size={30} />;
  }

  return null;
}

function getIconAccent(card: any) {
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

function getTypeLabel(card: any) {
  if (card.type === 'transport') {
    return 'Transport';
  }

  if (card.type === 'pay') {
    return 'Pay';
  }

  if (card.type === 'acquire') {
    return 'Acquire';
  }

  if (card.type === 'appointment') {
    return 'Appointment';
  }

  if (card.type === 'maintenance') {
    return 'Maintenance';
  }

  return card.type;
}

function getStateLabel(
  card: any,
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
  card: any,
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

  if (
    card.state === 'cancelled' ||
    card.state === 'stopped' ||
    card.state === 'expired'
  ) {
    return {
      background:
        'rgba(100, 116, 139, 0.11)',

      color: '#64748b',
    };
  }

  return {
    background:
      'rgba(24,32,44,0.06)',

    color: '#64748b',
  };
}

function getPersonLabel(
  id: 'me' | 'partner'
) {
  return id === 'me'
    ? 'You'
    : 'Partner';
}

export default function ExpandedCard({
  cardId,
  onClose,
}: Props) {
  const [showMenu, setShowMenu] =
    useState(false);

  const [showReschedule, setShowReschedule] =
    useState(false);

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

  const {
    user,
  } = useAuth();

  const partner =
    usePartner(
      (s) => s.partner
    );

  const activeCard =
    useCards((s) =>
      s.activeCards.find(
        (c) => c.id === cardId
      )
    );

  const historyCard =
    useCards((s) =>
      s.historyCards.find(
        (c) => c.id === cardId
      )
    );

  const card =
    activeCard ?? historyCard;

  const isHistoryCard =
    Boolean(historyCard);

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

  const removeHistoryCard =
    useCards(
      (s) => s.removeHistoryCard
    );

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

  const detailRows =
    getDetailRows(card);

  const iconAccent =
    getIconAccent(card);

  const stateStyle =
    getStateStyle(
      card,
      now
    );

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

    stopSupabaseCard({
      cardId: card.id,
    }).catch((error) => {
      console.error(
        'Could not stop Supabase card',
        error
      );
    });

    onClose();
  }

  function handleTake() {
    takeCard(card.id);

    takeSupabaseCard({
      cardId: card.id,

      currentUserId:
        user?.id,
    }).catch((error) => {
      console.error(
        'Could not take Supabase card',
        error
      );
    });

    onClose();
  }

  function handleRemoveFromHistory() {
    removeHistoryCard(card.id);

    removeSupabaseCard({
      cardId: card.id,
    }).catch((error) => {
      console.error(
        'Could not remove Supabase card from history',
        error
      );
    });

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

        zIndex: 100,

        background:
          'linear-gradient(180deg, #f7f9fb 0%, #eef2f6 100%)',

        overflowY: 'auto',

        padding:
          '18px 16px 28px',
      }}
    >
      <div
        style={{
          width: '100%',

          maxWidth: 520,

          minHeight:
            'calc(100vh - 36px)',

          margin: '0 auto',

          display: 'flex',

          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',

            justifyContent:
              'space-between',

            alignItems: 'center',

            marginBottom: 18,
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 42,

              height: 42,

              borderRadius: 16,

              border:
                '1px solid rgba(24,32,44,0.075)',

              background:
                'rgba(255,255,255,0.82)',

              boxShadow:
                '0 10px 26px rgba(31,41,55,0.06)',

              display: 'flex',

              alignItems: 'center',

              justifyContent:
                'center',

              cursor: 'pointer',

              color: '#18202c',
            }}
          >
            <X size={18} />
          </button>

          <div
            style={{
              display: 'flex',

              alignItems: 'center',

              gap: 10,

              position: 'relative',
            }}
          >
            {!isHistoryCard &&
              (isOwner ||
                canStop) && (
                <button
                  onClick={() =>
                    setShowMenu(
                      !showMenu
                    )
                  }
                  aria-label="More actions"
                  style={{
                    width: 42,

                    height: 42,

                    borderRadius: 16,

                    border:
                      '1px solid rgba(24,32,44,0.075)',

                    background:
                      'rgba(255,255,255,0.82)',

                    boxShadow:
                      '0 10px 26px rgba(31,41,55,0.06)',

                    display: 'flex',

                    alignItems:
                      'center',

                    justifyContent:
                      'center',

                    cursor:
                      'pointer',

                    color: '#18202c',
                  }}
                >
                  <MoreHorizontal
                    size={20}
                  />
                </button>
              )}

            {showMenu && (
              <div
                style={{
                  position:
                    'absolute',

                  top: 50,

                  right: 0,

                  width: 230,

                  borderRadius: 18,

                  border:
                    '1px solid rgba(24,32,44,0.075)',

                  background:
                    '#fff',

                  boxShadow:
                    '0 20px 52px rgba(31,41,55,0.18)',

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

                        height: 50,

                        border: 'none',

                        background:
                          '#fff',

                        textAlign:
                          'left',

                        padding:
                          '0 16px',

                        fontWeight: 650,

                        color: '#18202c',

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
                        '1px solid rgba(24,32,44,0.06)',

                      borderBottom:
                        '1px solid rgba(24,32,44,0.06)',

                      background:
                        '#f7f9fb',
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

                        color: '#465364',

                        fontWeight: 560,
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

                        color: '#465364',

                        fontWeight: 560,
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

                        color: '#465364',

                        fontWeight: 560,
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

                      height: 50,

                      border: 'none',

                      background: '#fff',

                      textAlign: 'left',

                      padding:
                        '0 16px',

                      fontWeight: 650,

                      color: '#18202c',

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

                      height: 50,

                      border: 'none',

                      background: '#fff',

                      textAlign: 'left',

                      padding:
                        '0 16px',

                      color: '#64748b',

                      fontWeight: 650,

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

                      height: 50,

                      border: 'none',

                      background: '#fff',

                      textAlign: 'left',

                      padding:
                        '0 16px',

                      color: '#dc2626',

                      fontWeight: 650,

                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            borderRadius: 28,

            background:
              'rgba(255,255,255,0.9)',

            border:
              '1px solid rgba(24,32,44,0.07)',

            boxShadow:
              '0 18px 45px rgba(31,41,55,0.08)',

            padding: 16,

            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: 'flex',

              alignItems:
                'flex-start',

              gap: 14,
            }}
          >
            <div
              style={{
                width: 78,

                height: 78,

                borderRadius: 24,

                background:
                  'linear-gradient(180deg, #ffffff 0%, #f1f4f8 100%)',

                border:
                  '1px solid rgba(24,32,44,0.06)',

                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 24px rgba(31,41,55,0.08)',

                display: 'flex',

                alignItems:
                  'center',

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
                  position:
                    'absolute',

                  inset: 0,

                  background:
                    'radial-gradient(circle at 25% 15%, rgba(255,255,255,0.95), transparent 34%)',
                }}
              />

              <div
                style={{
                  position:
                    'relative',

                  filter:
                    'drop-shadow(0 5px 6px rgba(31,41,55,0.16))',
                }}
              >
                {getIcon(card)}
              </div>
            </div>

            <div
              style={{
                minWidth: 0,

                flex: 1,

                paddingTop: 2,
              }}
            >
              <div
                style={{
                  display: 'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'space-between',

                  gap: 10,

                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 12,

                    color: '#8a94a3',

                    fontWeight: 700,

                    letterSpacing: 0.35,
                  }}
                >
                  {getTypeLabel(card)}
                </div>

                <div
                  style={{
                    display:
                      'inline-flex',

                    alignItems:
                      'center',

                    height: 26,

                    padding:
                      '0 10px',

                    borderRadius: 999,

                    background:
                      stateStyle.background,

                    color:
                      stateStyle.color,

                    fontSize: 10,

                    fontWeight: 700,

                    letterSpacing: 0.15,
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
                  fontSize: 24,

                  fontWeight: 760,

                  letterSpacing: -0.35,

                  color: '#18202c',

                  lineHeight: 1.08,

                  marginBottom: 7,
                }}
              >
                {title}
              </div>

              {context && (
                <div
                  style={{
                    fontSize: 14,

                    color: '#6f7a89',

                    lineHeight: 1.35,

                    fontWeight: 560,
                  }}
                >
                  {context}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',

              alignItems: 'center',

              justifyContent:
                'space-between',

              gap: 12,

              marginTop: 18,

              paddingTop: 14,

              borderTop:
                '1px solid rgba(24,32,44,0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',

                flexDirection:
                  'column',

                gap: 3,
              }}
            >
              <div
                style={{
                  fontSize: 11,

                  color: '#9aa3af',

                  fontWeight: 700,
                }}
              >
                Responsible
              </div>

              <div
                style={{
                  fontSize: 13,

                  color: '#18202c',

                  fontWeight: 650,
                }}
              >
                {getPersonLabel(
                  card.ownerId
                )}
              </div>
            </div>

            {card.dueAt && (
              <div
                style={{
                  display:
                    'inline-flex',

                  alignItems:
                    'center',

                  gap: 7,

                  padding:
                    '9px 11px',

                  borderRadius: 999,

                  background:
                    isActiveOverdue(
                      card,
                      now
                    )
                      ? 'rgba(239,68,68,0.1)'
                      : isDelayed
                      ? 'rgba(245,158,11,0.12)'
                      : 'rgba(24,32,44,0.055)',

                  color:
                    isActiveOverdue(
                      card,
                      now
                    )
                      ? '#dc2626'
                      : isDelayed
                      ? '#d97706'
                      : '#64748b',

                  fontSize: 12,

                  fontWeight: 700,

                  whiteSpace:
                    'nowrap',
                }}
              >
                <Clock3 size={14} />

                {formatDueAt(
                  card.dueAt
                )}
              </div>
            )}
          </div>
        </div>

        {detailRows.length > 0 && (
          <div
            style={{
              borderRadius: 24,

              background:
                'rgba(255,255,255,0.88)',

              border:
                '1px solid rgba(24,32,44,0.07)',

              boxShadow:
                '0 14px 34px rgba(31,41,55,0.065)',

              padding: 16,

              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontSize: 12,

                color: '#8a94a3',

                fontWeight: 700,

                letterSpacing: 0.55,

                textTransform:
                  'uppercase',

                marginBottom: 12,
              }}
            >
              Details
            </div>

            <div
              style={{
                display: 'flex',

                flexDirection:
                  'column',
              }}
            >
              {detailRows.map(
                (row, index) => (
                  <div
                    key={row.label}
                    style={{
                      display:
                        'flex',

                      justifyContent:
                        'space-between',

                      gap: 18,

                      padding:
                        index === 0
                          ? '0 0 13px'
                          : '13px 0',

                      borderBottom:
                        index ===
                        detailRows.length -
                          1
                          ? 'none'
                          : '1px solid rgba(24,32,44,0.055)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,

                        color: '#8a94a3',

                        fontWeight: 650,
                      }}
                    >
                      {row.label}
                    </div>

                    <div
                      style={{
                        fontSize: 14,

                        color: '#18202c',

                        fontWeight: 650,

                        textAlign:
                          'right',

                        lineHeight: 1.35,

                        maxWidth: '66%',
                      }}
                    >
                      {row.value}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: 'auto',

            paddingTop: 12,

            display: 'flex',

            flexDirection: 'column',

            gap: 10,
          }}
        >
          {isHistoryCard && (
            <button
              onClick={
                handleRemoveFromHistory
              }
              style={{
                width: '100%',

                height: 58,

                borderRadius: 20,

                border:
                  '1px solid rgba(24,32,44,0.08)',

                background:
                  'rgba(255,255,255,0.88)',

                color: '#64748b',

                fontSize: 15,

                fontWeight: 760,

                cursor: 'pointer',

                boxShadow:
                  '0 10px 24px rgba(31,41,55,0.055)',
              }}
            >
              Remove from history
            </button>
          )}

          {!isHistoryCard &&
            isSurfaced && (
              <button
                onClick={handleTake}
                style={{
                  width: '100%',

                  height: 58,

                  borderRadius: 20,

                  border:
                    '1px solid rgba(255,255,255,0.24)',

                  background:
                    'linear-gradient(180deg, #283242 0%, #111722 100%)',

                  color: '#fff',

                  fontSize: 15,

                  fontWeight: 760,

                  cursor: 'pointer',

                  boxShadow:
                    '0 16px 36px rgba(17,24,39,0.22)',
                }}
              >
                I’ll handle it
              </button>
            )}

          {!isHistoryCard &&
            isOwner &&
            isRequested && (
              <button
                onClick={
                  handleAccept
                }
                style={{
                  width: '100%',

                  height: 58,

                  borderRadius: 20,

                  border:
                    '1px solid rgba(255,255,255,0.24)',

                  background:
                    'linear-gradient(180deg, #283242 0%, #111722 100%)',

                  color: '#fff',

                  fontSize: 15,

                  fontWeight: 760,

                  cursor: 'pointer',

                  boxShadow:
                    '0 16px 36px rgba(17,24,39,0.22)',
                }}
              >
                Accept
              </button>
            )}

          {!isHistoryCard &&
            isOwner &&
            isAccepted && (
              <button
                onClick={handleDone}
                style={{
                  width: '100%',

                  height: 58,

                  borderRadius: 20,

                  border:
                    '1px solid rgba(255,255,255,0.24)',

                  background:
                    'linear-gradient(180deg, #283242 0%, #111722 100%)',

                  color: '#fff',

                  fontSize: 15,

                  fontWeight: 760,

                  cursor: 'pointer',

                  boxShadow:
                    '0 16px 36px rgba(17,24,39,0.22)',
                }}
              >
                Done
              </button>
            )}

          {!isHistoryCard &&
            isOwner &&
            isAccepted && (
              <button
                onClick={
                  handleDecline
                }
                style={{
                  width: '100%',

                  height: 52,

                  borderRadius: 18,

                  border:
                    '1px solid rgba(24,32,44,0.08)',

                  background:
                    'rgba(255,255,255,0.78)',

                  color: '#64748b',

                  fontSize: 14,

                  fontWeight: 760,

                  cursor: 'pointer',
                }}
              >
                Decline
              </button>
            )}
        </div>
      </div>
    </div>
  );
}