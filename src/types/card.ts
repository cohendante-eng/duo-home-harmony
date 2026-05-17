export type UserId = 'me' | 'partner';

export type CardState =
  | 'requested'
  | 'accepted'
  | 'delayed'
  | 'done'
  | 'stopped'
  | 'cancelled'
  | 'expired';

export type CardModifier =
  | 'updated'
  | 'returned'
  | null;

export type TransportPayload = {
  title: string;
  from: string;
  to: string;
};

export type PayPayload = {
  title: string;
  amount: string;
  recipient: string;
};

export type AcquirePayload = {
  item: string;
  source: string;
  quantity: string;
};

export type AppointmentPayload = {
  title: string;
  location: string;
  time: string;
};

export type MaintenancePayload = {
  title: string;
  location: string;
};

type BaseCard = {
  id: string;

  state: CardState;

  ownerId: UserId;
  creatorId: UserId;

  blockCount?: number;
  dueAt?: number;

  reminderSentAt?: number;

  modifier?: CardModifier;
  modifierFor?: UserId;
};

export type DuoCard =
  | (BaseCard & {
      type: 'transport';
      payload: TransportPayload;
    })

  | (BaseCard & {
      type: 'pay';
      payload: PayPayload;
    })

  | (BaseCard & {
      type: 'acquire';
      payload: AcquirePayload;
    })

  | (BaseCard & {
      type: 'appointment';
      payload: AppointmentPayload;
    })

  | (BaseCard & {
      type: 'maintenance';
      payload: MaintenancePayload;
    });