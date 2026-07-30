import {
  useState,
} from 'react';

import {
  ChevronLeft,
  X,
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

import {
  IconTile,
  cardSurfaceStyle,
  duoColors,
  getTypeLabel,
  inputStyle,
  panelInnerStyle,
  panelScreenStyle,
  primaryButtonStyle,
} from '../../styles/ui';

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

function closeButtonStyle():
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

function SectionTitle({
  children,
}: {
  children: string;
}) {
  return (
    <div
      style={{
        fontSize: 12,

        fontWeight: 650,

        letterSpacing: 0.65,

        textTransform:
          'uppercase',

        color:
          duoColors.softMuted,

        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
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

  const [isCreating, setIsCreating] =
    useState(false);

  const [createError, setCreateError] =
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

    setIsCreating(false);

    setCreateError('');

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
      !canCreate ||
      isCreating
    ) {
      return;
    }

    setCreateError('');

    if (
      !user ||
      !partner?.connectionId ||
      !partner?.id
    ) {
      setCreateError(
        'Duo needs an active partner connection before creating a responsibility.'
      );

      return;
    }

    setIsCreating(true);

    const dueAt =
      buildDueAt();

    const localOwnerId =
      ownerId;

    const localCreatorId =
      currentUser;

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
    } catch (error) {
      console.error(
        'Could not create Supabase card',
        error
      );

      setCreateError(
        'Could not create this responsibility. Please try again.'
      );

      setIsCreating(false);
    }
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
      minHeight: 40,

      padding: '0 14px',

      borderRadius: 999,

      border: selected
        ? '1px solid rgba(24,32,44,0.9)'
        : '1px solid rgba(24,32,44,0.08)',

      background: selected
        ? duoColors.text
        : 'rgba(255,255,255,0.82)',

      color: selected
        ? '#fff'
        : duoColors.muted,

      fontSize: 13,

      fontWeight: 600,

      cursor: 'pointer',

      boxShadow: selected
        ? '0 10px 22px rgba(17,24,39,0.16)'
        : 'none',
    };
  }

  if (!open) {
    return null;
  }

  return (
    <div
      style={panelScreenStyle}
    >
      <div
        style={{
          ...panelInnerStyle,

          paddingBottom:
            step === 'fields'
              ? 88
              : 0,
        }}
      >
        <div
          style={{
            display: 'flex',

            justifyContent:
              'space-between',

            alignItems:
              'center',

            marginBottom: 22,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 28,

                fontWeight: 700,

                letterSpacing: -0.7,

                color: duoColors.text,

                lineHeight: 1.05,
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

                color: duoColors.muted,

                fontWeight: 500,
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

                setCreateError('');

                return;
              }

              resetFlow();
            }}
            aria-label={
              step === 'fields'
                ? 'Back'
                : 'Close create'
            }
            style={closeButtonStyle()}
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

                    setCreateError('');
                  }}
                  style={{
                    ...cardSurfaceStyle,

                    minHeight: 94,

                    textAlign:
                      'left',

                    padding: 14,

                    display:
                      'flex',

                    alignItems:
                      'center',

                    gap: 14,

                    cursor:
                      'pointer',
                  }}
                >
                  <IconTile
                    type={
                      template.type
                    }
                    size={66}
                    iconSize={30}
                  />

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

                        color:
                          duoColors.text,

                        marginBottom: 5,

                        letterSpacing:
                          -0.15,
                      }}
                    >
                      {
                        template.label
                      }
                    </div>

                    <div
                      style={{
                        fontSize: 13,

                        lineHeight: 1.38,

                        color:
                          duoColors.muted,

                        fontWeight: 500,
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
                ...cardSurfaceStyle,

                padding: 17,

                marginBottom: 14,
              }}
            >
              <SectionTitle>
                Responsibility
              </SectionTitle>

              <div
                style={{
                  display:
                    'inline-flex',

                  padding: 4,

                  borderRadius: 999,

                  background:
                    'rgba(24,32,44,0.045)',

                  border:
                    '1px solid rgba(24,32,44,0.055)',
                }}
              >
                <button
                  onClick={() =>
                    setOwnerId('me')
                  }
                  style={{
                    height: 36,

                    padding:
                      '0 17px',

                    borderRadius: 999,

                    border: 'none',

                    background:
                      ownerId === 'me'
                        ? duoColors.text
                        : 'transparent',

                    color:
                      ownerId === 'me'
                        ? '#fff'
                        : duoColors.muted,

                    cursor: 'pointer',

                    fontWeight: 600,

                    fontSize: 13,

                    boxShadow:
                      ownerId === 'me'
                        ? '0 8px 18px rgba(17,24,39,0.16)'
                        : 'none',
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
                    height: 36,

                    padding:
                      '0 17px',

                    borderRadius: 999,

                    border: 'none',

                    background:
                      ownerId ===
                      'partner'
                        ? duoColors.text
                        : 'transparent',

                    color:
                      ownerId ===
                      'partner'
                        ? '#fff'
                        : duoColors.muted,

                    cursor: 'pointer',

                    fontWeight: 600,

                    fontSize: 13,

                    boxShadow:
                      ownerId ===
                      'partner'
                        ? '0 8px 18px rgba(17,24,39,0.16)'
                        : 'none',
                  }}
                >
                  Partner
                </button>
              </div>
            </section>

            <section
              style={{
                ...cardSurfaceStyle,

                padding: 17,

                marginBottom: 14,
              }}
            >
              <SectionTitle>
                Details
              </SectionTitle>

              <div
                style={{
                  display: 'flex',

                  flexDirection:
                    'column',

                  gap: 12,
                }}
              >
                {renderFields()}
              </div>
            </section>

            <section
              style={{
                ...cardSurfaceStyle,

                padding: 17,

                marginBottom: 14,
              }}
            >
              <SectionTitle>
                Time
              </SectionTitle>

              <div
                style={{
                  display: 'flex',

                  flexWrap: 'wrap',

                  gap: 8,

                  marginBottom:
                    timeMode === 'other'
                      ? 14
                      : 0,
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

              {timeMode === 'other' && (
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
                    style={inputStyle}
                  />

                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) =>
                      setDueTime(
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </div>
              )}
            </section>

            {createError && (
              <div
                style={{
                  marginBottom: 14,

                  padding:
                    '12px 14px',

                  borderRadius: 18,

                  background:
                    'rgba(229, 57, 53, 0.08)',

                  color: duoColors.red,

                  fontSize: 13,

                  lineHeight: 1.4,

                  fontWeight: 600,
                }}
              >
                {createError}
              </div>
            )}

            <button
              onClick={
                handleCreate
              }
              disabled={
                !canCreate ||
                isCreating
              }
              style={{
                ...primaryButtonStyle,

                position: 'fixed',

                left: '50%',

                bottom: 24,

                transform:
                  'translateX(-50%)',

                width:
                  'min(calc(100% - 32px), 488px)',

                opacity:
                  canCreate &&
                  !isCreating
                    ? 1
                    : 0.42,

                cursor:
                  canCreate &&
                  !isCreating
                    ? 'pointer'
                    : 'default',

                zIndex: 120,
              }}
            >
              {isCreating
                ? 'Creating...'
                : 'Create'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}