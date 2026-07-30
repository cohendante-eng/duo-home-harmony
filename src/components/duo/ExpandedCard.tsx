import {
  Clock3,
  MoreHorizontal,
  X,
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

import {
  IconTile,
  cardSurfaceStyle,
  duoColors,
  formatDueAt,
  getStatusLabel,
  getStatusStyle,
  getTypeLabel,
  panelInnerStyle,
  panelScreenStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from '../../styles/ui';

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

function getPersonLabel(
  id: 'me' | 'partner'
) {
  return id === 'me'
    ? 'You'
    : 'Partner';
}

function circleButtonStyle():
  React.CSSProperties {
  return {
    width: 44,

    height: 44,

    borderRadius: 17,

    border:
      '1px solid rgba(24,32,44,0.075)',

    background:
      'rgba(255,255,255,0.84)',

    boxShadow:
      '0 12px 28px rgba(31,41,55,0.07)',

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'center',

    cursor: 'pointer',

    color: duoColors.text,
  };
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

  const isOverdue =
    isActiveOverdue(
      card,
      now
    );

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

  const stateStyle =
    getStatusStyle(
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
      style={panelScreenStyle}
    >
      <div
        style={panelInnerStyle}
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
            style={circleButtonStyle()}
          >
            <X size={18} />
          </button>

          <div
            style={{
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
                  style={circleButtonStyle()}
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

                  top: 52,

                  right: 0,

                  width: 230,

                  borderRadius: 19,

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

                        fontWeight: 600,

                        color: duoColors.text,

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
                    {[
                      [30, '+30 minutes'],
                      [60, '+1 hour'],
                      [180, '+3 hours'],
                    ].map(([minutes, label]) => (
                      <button
                        key={String(
                          minutes
                        )}
                        onClick={() =>
                          handleReschedule(
                            Number(
                              minutes
                            )
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

                          fontWeight: 500,
                        }}
                      >
                        {label}
                      </button>
                    ))}
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

                      fontWeight: 600,

                      color: duoColors.text,

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

                      color: duoColors.muted,

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

                      height: 50,

                      border: 'none',

                      background: '#fff',

                      textAlign: 'left',

                      padding:
                        '0 16px',

                      color: duoColors.red,

                      fontWeight: 600,

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

        <section
          style={{
            ...cardSurfaceStyle,

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
            <IconTile
              type={card.type}
              size={78}
              iconSize={31}
            />

            <div
              style={{
                minWidth: 0,

                flex: 1,

                paddingTop: 3,
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

                    color: duoColors.muted,

                    fontWeight: 600,

                    letterSpacing: 0.25,
                  }}
                >
                  {getTypeLabel(
                    card.type
                  )}
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

                    fontWeight: 650,

                    letterSpacing: 0.1,
                  }}
                >
                  {getStatusLabel(
                    card,
                    now
                  )}
                </div>
              </div>

              <div
                style={{
                  fontSize: 24,

                  fontWeight: 700,

                  letterSpacing: -0.35,

                  color: duoColors.text,

                  lineHeight: 1.1,

                  marginBottom: 7,
                }}
              >
                {title}
              </div>

              {context && (
                <div
                  style={{
                    fontSize: 14,

                    color: duoColors.muted,

                    lineHeight: 1.35,

                    fontWeight: 500,
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

                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 11,

                  color:
                    duoColors.softMuted,

                  fontWeight: 650,
                }}
              >
                Responsible
              </div>

              <div
                style={{
                  fontSize: 13,

                  color: duoColors.text,

                  fontWeight: 600,
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

                  background: isOverdue
                    ? 'rgba(229,57,53,0.1)'
                    : isDelayed
                    ? 'rgba(225,132,16,0.13)'
                    : 'rgba(24,32,44,0.055)',

                  color: isOverdue
                    ? duoColors.red
                    : isDelayed
                    ? duoColors.amber
                    : duoColors.muted,

                  fontSize: 12,

                  fontWeight: 650,

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
        </section>

        {detailRows.length > 0 && (
          <section
            style={{
              ...cardSurfaceStyle,

              padding: 16,

              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontSize: 12,

                color: duoColors.muted,

                fontWeight: 650,

                letterSpacing: 0.5,

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

                        color:
                          duoColors.muted,

                        fontWeight: 500,
                      }}
                    >
                      {row.label}
                    </div>

                    <div
                      style={{
                        fontSize: 14,

                        color:
                          duoColors.text,

                        fontWeight: 600,

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
          </section>
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
                ...secondaryButtonStyle,

                width: '100%',

                height: 58,

                fontWeight: 650,
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
                  ...primaryButtonStyle,

                  width: '100%',
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
                  ...primaryButtonStyle,

                  width: '100%',
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
                  ...primaryButtonStyle,

                  width: '100%',
                }}
              >
                Done
              </button>
            )}
        </div>
      </div>
    </div>
  );
}