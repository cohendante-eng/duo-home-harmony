import { useState } from 'react';

import {
  ChevronLeft,
} from 'lucide-react';

import {
  useCards,
} from '../../store/useCards';

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

type Props = {
  open: boolean;

  onClose: () => void;
};

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

  const [dueDate, setDueDate] =
    useState('');

  const [dueTime, setDueTime] =
    useState('');

  function resetFlow() {
    setStep('types');

    setSelectedType(null);

    setPayload({});

    setDueDate('');

    setDueTime('');

    setOwnerId('partner');

    onClose();
  }

  function buildDueAt() {
    if (!dueDate) {
      return undefined;
    }

    const time =
      dueTime || '12:00';

    return new Date(
      `${dueDate}T${time}`
    ).getTime();
  }

  function handleCreate() {
    if (!selectedType) {
      return;
    }

    createCard({
      type: selectedType,

      payload,

      ownerId,

      creatorId: currentUser,

      dueAt: buildDueAt(),
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

        padding: 20,

        paddingBottom: 140,
      }}
    >
      <div
        style={{
          display: 'flex',

          justifyContent:
            'space-between',

          alignItems: 'center',

          marginBottom: 34,
        }}
      >
        <div
          style={{
            fontSize: 22,

            fontWeight: 700,
          }}
        >
          {selectedType
            ? CARD_TEMPLATES.find(
                (t) =>
                  t.type ===
                  selectedType
              )?.label
            : 'Create'}
        </div>

        <button
          onClick={() => {
            if (
              step === 'fields'
            ) {
              setStep(
                'types'
              );

              return;
            }

            resetFlow();
          }}
          style={{
            width: 42,

            height: 42,

            borderRadius: 14,

            border:
              '1px solid rgba(0,0,0,0.08)',

            background: '#fff',

            display: 'flex',

            alignItems:
              'center',

            justifyContent:
              'center',

            cursor: 'pointer',
          }}
        >
          <ChevronLeft
            size={18}
          />
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
                  height: 64,

                  borderRadius: 18,

                  border:
                    '1px solid rgba(0,0,0,0.08)',

                  background:
                    '#fff',

                  textAlign:
                    'left',

                  padding:
                    '0 18px',

                  fontSize: 16,

                  fontWeight: 600,

                  cursor: 'pointer',
                }}
              >
                {
                  template.label
                }
              </button>
            )
          )}
        </div>
      )}

      {step === 'fields' && (
        <>
          <div
            style={{
              display: 'flex',

              gap: 10,

              marginBottom: 28,
            }}
          >
            <button
              onClick={() =>
                setOwnerId(
                  'me'
                )
              }
              style={{
                height: 42,

                padding:
                  '0 16px',

                borderRadius: 14,

                border:
                  ownerId ===
                  'me'
                    ? '1px solid #111'
                    : '1px solid rgba(0,0,0,0.08)',

                background:
                  ownerId ===
                  'me'
                    ? '#111'
                    : '#fff',

                color:
                  ownerId ===
                  'me'
                    ? '#fff'
                    : '#111',
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
                height: 42,

                padding:
                  '0 16px',

                borderRadius: 14,

                border:
                  ownerId ===
                  'partner'
                    ? '1px solid #111'
                    : '1px solid rgba(0,0,0,0.08)',

                background:
                  ownerId ===
                  'partner'
                    ? '#111'
                    : '#fff',

                color:
                  ownerId ===
                  'partner'
                    ? '#fff'
                    : '#111',
              }}
            >
              Partner
            </button>
          </div>

          <div
            style={{
              display: 'flex',

              flexDirection:
                'column',

              gap: 18,
            }}
          >
            {renderFields()}

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

                borderRadius: 16,

                border:
                  '1px solid rgba(0,0,0,0.08)',

                padding:
                  '0 16px',

                fontSize: 16,
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

                borderRadius: 16,

                border:
                  '1px solid rgba(0,0,0,0.08)',

                padding:
                  '0 16px',

                fontSize: 16,
              }}
            />
          </div>

          <button
            onClick={
              handleCreate
            }
            style={{
              position: 'fixed',

              left: 20,

              right: 20,

              bottom: 96,

              height: 58,

              borderRadius: 18,

              border: 'none',

              background:
                '#111',

              color: '#fff',

              fontSize: 16,

              fontWeight: 700,

              boxShadow:
                '0 10px 30px rgba(0,0,0,0.12)',

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