import { useState } from 'react';

import {
  ChevronLeft,
  X,
  CarFront,
  CreditCard,
  ShoppingBag,
  Calendar,
  Wrench,
} from 'lucide-react';

import {
  useCards,
} from '../../store/useCards';

import {
  usePartner,
} from '../../store/usePartner';

import {
  useAuth,
} from '../../hooks/useAuth';

import {
  createSupabaseCard,
} from '../../lib/supabaseCards';

import {
  DuoCard,
} from '../../types/card';

import {
  CARD_TEMPLATES,
} from './cardTemplates';

import TransportFields from './templates/TransportFields';

import PayFields from './templates/PayFields';

import AcquireFields from './templates/AcquireFields';

import AppointmentFields from './templates/AppointmentFields';

import MaintenanceFields from './templates/MaintenanceFields';

type Step =
  | 'types'
  | 'fields';

type TimeMode =
  | 'none'
  | 'today'
  | 'tomorrow'
  | 'other';

type Props = {
  open: boolean;

  onClose: () => void;
};

function getTypeIcon(
  type: DuoCard['type']
) {
  if (type === 'transport') {
    return <CarFront size={22} />;
  }

  if (type === 'pay') {
    return <CreditCard size={22} />;
  }

  if (type === 'acquire') {
    return <ShoppingBag size={22} />;
  }

  if (type === 'appointment') {
    return <Calendar size={22} />;
  }

  if (type === 'maintenance') {
    return <Wrench size={22} />;
  }

  return null;
}

function getTypeDescription(
  type: DuoCard['type']
) {
  if (type === 'transport') {
    return 'Move a person or item from one place to another.';
  }

  if (type === 'pay') {
    return 'Track a payment responsibility.';
  }

  if (type === 'acquire') {
    return 'Get something from a store, place, or source.';
  }

  if (type === 'appointment') {
    return 'Handle a scheduled visit or meeting.';
  }

  if (type === 'maintenance') {
    return 'Fix, check, repair, or maintain something.';
  }

  return '';
}

function getDateString(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, '0');

  const day =
    String(
      date.getDate()
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function CreateFlow({
  open,

  onClose,
}: Props) {
  const createCard =
    useCards(
      (s) => s.createCard
    );

  const currentUser =
    useCards(
      (s) => s.currentUser
    );

  const {
    user,
  } = useAuth();

  const partner =
    usePartner(
      (s) => s.partner
    );

  const [step, setStep] =
    useState<Step>('types');

  const [selectedType, setSelectedType] =
    useState<
      DuoCard['type'] | null
    >(null);

  const [ownerId, setOwnerId] =
    useState<
      'me' | 'partner'
    >('partner');

  const [payload, setPayload] =
    useState<any>({});

  const [timeMode, setTimeMode] =
    useState<TimeMode>('none');

  const [dueDate, setDueDate] =
    useState('');

  const [dueTime, setDueTime] =
    useState('');

  const selectedTemplate =
    selectedType
      ? CARD_TEMPLATES.find(
          (template) =>
            template.type ===
            selectedType
        )
      : null;

  const canCreate =
    Boolean(
      payload.title ||
        payload.item
    );

  function resetFlow() {
    setStep('types');

    setSelectedType(null);

    setPayload({});

    setTimeMode('none');

    setDueDate('');

    setDueTime('');

    setOwnerId('partner');

    onClose();
  }

  function buildDueAt() {
    if (timeMode === 'none') {
      return undefined;
    }

    const now =
      new Date();

    if (timeMode === 'today') {
      const today =
        getDateString(now);

      return new Date(
        `${today}T18:00`
      ).getTime();
    }

    if (timeMode === 'tomorrow') {
      const tomorrow =
        new Date(now);

      tomorrow.setDate(
        tomorrow.getDate() + 1
      );

      return new Date(
        `${getDateString(
          tomorrow
        )}T09:00`
      ).getTime();
    }

    if (
      timeMode === 'other' &&
      dueDate
    ) {
      const time =
        dueTime || '12:00';

      return new Date(
        `${dueDate}T${time}`
      ).getTime();
    }

    return undefined;
  }

  async function handleCreate() {
    if (
      !selectedType ||
      !canCreate
    ) {
      return;
    }

    const dueAt =
      buildDueAt();

    const localOwnerId =
      ownerId;

    const localCreatorId =
      currentUser;

    if (
      user &&
      partner?.connectionId &&
      partner?.id
    ) {
      const supabaseOwnerId =
        localOwnerId === 'me'
          ? user.id
          : partner.id;

      try {
        const createdCard =
          await createSupabaseCard({
            partnerConnectionId:
              partner.connectionId,

            type: selectedType,

            ownerId:
              supabaseOwnerId,

            creatorId:
              user.id,

            payload,

            dueAt,
          });

        createCard({
          id: createdCard.id,

          type: selectedType,

          payload,

          ownerId:
            localOwnerId,

          creatorId:
            localCreatorId,

          dueAt,
        } as any);

        resetFlow();

        return;
      } catch (error) {
        console.error(
          'Could not create Supabase card',
          error
        );
      }
    }

    createCard({
      type: selectedType,

      payload,

      ownerId:
        localOwnerId,

      creatorId:
        localCreatorId,

      dueAt,
    } as any);

    resetFlow();
  }

  function renderFields() {
    if (!selectedType) {
      return null;
    }

    switch (selectedType) {
      case 'transport':
        return (
          <TransportFields
            payload={payload}
            setPayload={
              setPayload
            }
          />
        );

      case 'pay':
        return (
          <PayFields
            payload={payload}
            setPayload={
              setPayload
            }
          />
        );

      case 'acquire':
        return (
          <AcquireFields
            payload={payload}
            setPayload={
              setPayload
            }
          />
        );

      case 'appointment':
        return (
          <AppointmentFields
            payload={payload}
            setPayload={
              setPayload
            }
          />
        );

      case 'maintenance':
        return (
          <MaintenanceFields
            payload={payload}
            setPayload={
              setPayload
            }
          />
        );

      default:
        return null;
    }
  }

  function getTimeButtonStyle(
    mode: TimeMode
  ) {
    const selected =
      timeMode === mode;

    return {
      height: 40,

      padding: '0 14px',

      borderRadius: 999,

      border: selected
        ? '1px solid #111'
        : '1px solid rgba(0,0,0,0.07)',

      background: selected
        ? '#111'
        : '#fff',

      color: selected
        ? '#fff'
        : '#777',

      fontSize: 13,

      fontWeight: 700,

      cursor: 'pointer',
    };
  }

  if (!open) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',

        inset: 0,

        background: '#fff',

        zIndex: 100,

        overflowY: 'auto',

        padding: 24,

        paddingBottom: 190,
      }}
    >
      <div
        style={{
          display: 'flex',

          justifyContent:
            'space-between',

          alignItems: 'center',

          marginBottom: 30,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 28,

              fontWeight: 750,

              letterSpacing: -0.4,

              color: '#111',
            }}
          >
            {selectedTemplate
              ? selectedTemplate.label
              : 'Create'}
          </div>

          <div
            style={{
              marginTop: 6,

              fontSize: 13,

              color: '#999',
            }}
          >
            {step === 'types'
              ? 'Choose the responsibility type.'
              : 'Fill only what is needed.'}
          </div>
        </div>

        <button
          onClick={() => {
            if (
              step === 'fields'
            ) {
              setStep('types');

              setSelectedType(null);

              setPayload({});

              setTimeMode('none');

              setDueDate('');

              setDueTime('');

              return;
            }

            resetFlow();
          }}
          style={{
            width: 40,

            height: 40,

            borderRadius: 999,

            border:
              '1px solid rgba(0,0,0,0.06)',

            background: '#fff',

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            cursor: 'pointer',
          }}
        >
          {step === 'fields' ? (
            <ChevronLeft
              size={19}
            />
          ) : (
            <X size={18} />
          )}
        </button>
      </div>

      {step === 'types' && (
        <div
          style={{
            display: 'flex',

            flexDirection:
              'column',

            gap: 12,
          }}
        >
          {CARD_TEMPLATES.map(
            (template) => (
              <button
                key={
                  template.type
                }
                onClick={() => {
                  setSelectedType(
                    template.type
                  );

                  setStep(
                    'fields'
                  );
                }}
                style={{
                  minHeight: 76,

                  borderRadius: 20,

                  border:
                    '1px solid rgba(0,0,0,0.06)',

                  background:
                    '#fff',

                  textAlign:
                    'left',

                  padding: 16,

                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap: 14,

                  cursor:
                    'pointer',
                }}
              >
                <div
                  style={{
                    width: 46,

                    height: 46,

                    borderRadius: 15,

                    background:
                      'rgba(0,0,0,0.04)',

                    display:
                      'flex',

                    alignItems:
                      'center',

                    justifyContent:
                      'center',

                    color: '#555',

                    flexShrink: 0,
                  }}
                >
                  {getTypeIcon(
                    template.type
                  )}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 16,

                      fontWeight: 700,

                      color: '#111',

                      marginBottom: 4,
                    }}
                  >
                    {
                      template.label
                    }
                  </div>

                  <div
                    style={{
                      fontSize: 13,

                      lineHeight: 1.35,

                      color: '#888',
                    }}
                  >
                    {getTypeDescription(
                      template.type
                    )}
                  </div>
                </div>
              </button>
            )
          )}
        </div>
      )}

      {step === 'fields' && (
        <>
          <section
            style={{
              marginBottom: 28,
            }}
          >
            <div
              style={{
                fontSize: 12,

                fontWeight: 750,

                letterSpacing: 0.6,

                textTransform:
                  'uppercase',

                color: '#aaa',

                marginBottom: 10,
              }}
            >
              Responsibility
            </div>

            <div
              style={{
                display:
                  'inline-flex',

                padding: 4,

                borderRadius: 999,

                background:
                  'rgba(0,0,0,0.035)',

                border:
                  '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <button
                onClick={() =>
                  setOwnerId('me')
                }
                style={{
                  height: 34,

                  padding:
                    '0 16px',

                  borderRadius: 999,

                  border: 'none',

                  background:
                    ownerId === 'me'
                      ? '#111'
                      : 'transparent',

                  color:
                    ownerId === 'me'
                      ? '#fff'
                      : '#777',

                  cursor: 'pointer',

                  fontWeight: 700,

                  fontSize: 13,
                }}
              >
                Me
              </button>

              <button
                onClick={() =>
                  setOwnerId(
                    'partner'
                  )
                }
                style={{
                  height: 34,

                  padding:
                    '0 16px',

                  borderRadius: 999,

                  border: 'none',

                  background:
                    ownerId ===
                    'partner'
                      ? '#111'
                      : 'transparent',

                  color:
                    ownerId ===
                    'partner'
                      ? '#fff'
                      : '#777',

                  cursor: 'pointer',

                  fontWeight: 700,

                  fontSize: 13,
                }}
              >
                Partner
              </button>
            </div>
          </section>

          <section
            style={{
              marginBottom: 28,
            }}
          >
            <div
              style={{
                fontSize: 12,

                fontWeight: 750,

                letterSpacing: 0.6,

                textTransform:
                  'uppercase',

                color: '#aaa',

                marginBottom: 10,
              }}
            >
              Details
            </div>

            <div
              style={{
                display: 'flex',

                flexDirection:
                  'column',

                gap: 14,
              }}
            >
              {renderFields()}
            </div>
          </section>

          <section>
            <div
              style={{
                fontSize: 12,

                fontWeight: 750,

                letterSpacing: 0.6,

                textTransform:
                  'uppercase',

                color: '#aaa',

                marginBottom: 10,
              }}
            >
              Time
            </div>

            <div
              style={{
                display: 'flex',

                flexWrap: 'wrap',

                gap: 8,

                marginBottom: 14,
              }}
            >
              <button
                onClick={() => {
                  setTimeMode('none');

                  setDueDate('');

                  setDueTime('');
                }}
                style={getTimeButtonStyle(
                  'none'
                )}
              >
                No time
              </button>

              <button
                onClick={() => {
                  setTimeMode('today');

                  setDueDate('');

                  setDueTime('');
                }}
                style={getTimeButtonStyle(
                  'today'
                )}
              >
                Today
              </button>

              <button
                onClick={() => {
                  setTimeMode(
                    'tomorrow'
                  );

                  setDueDate('');

                  setDueTime('');
                }}
                style={getTimeButtonStyle(
                  'tomorrow'
                )}
              >
                Tomorrow
              </button>

              <button
                onClick={() =>
                  setTimeMode('other')
                }
                style={getTimeButtonStyle(
                  'other'
                )}
              >
                Other
              </button>
            </div>

            <div
              style={{
                minHeight: 54,

                transition:
                  'opacity 0.16s ease',

                opacity:
                  timeMode === 'other'
                    ? 1
                    : 0,

                pointerEvents:
                  timeMode === 'other'
                    ? 'auto'
                    : 'none',
              }}
            >
              <div
                style={{
                  display: 'grid',

                  gridTemplateColumns:
                    '1fr 1fr',

                  gap: 10,
                }}
              >
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) =>
                    setDueDate(
                      e.target.value
                    )
                  }
                  style={{
                    height: 52,

                    borderRadius: 17,

                    border:
                      '1px solid rgba(0,0,0,0.08)',

                    padding:
                      '0 14px',

                    fontSize: 15,

                    background:
                      '#fff',
                  }}
                />

                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) =>
                    setDueTime(
                      e.target.value
                    )
                  }
                  style={{
                    height: 52,

                    borderRadius: 17,

                    border:
                      '1px solid rgba(0,0,0,0.08)',

                    padding:
                      '0 14px',

                    fontSize: 15,

                    background:
                      '#fff',
                  }}
                />
              </div>
            </div>
          </section>

          <button
            onClick={
              handleCreate
            }
            disabled={!canCreate}
            style={{
              position: 'fixed',

              left: 24,

              right: 24,

              bottom: 28,

              height: 58,

              borderRadius: 18,

              border: 'none',

              background:
                canCreate
                  ? '#111'
                  : 'rgba(0,0,0,0.12)',

              color: '#fff',

              fontSize: 16,

              fontWeight: 750,

              boxShadow:
                canCreate
                  ? '0 10px 30px rgba(0,0,0,0.12)'
                  : 'none',

              cursor:
                canCreate
                  ? 'pointer'
                  : 'default',

              zIndex: 120,
            }}
          >
            Create
          </button>
        </>
      )}
    </div>
  );
}