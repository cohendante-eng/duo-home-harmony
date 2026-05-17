import { DuoCard } from '../types/card';

export function getCardTitle(
  card: DuoCard
) {
  if (card.type === 'acquire') {
    return `Get ${card.payload.item}`;
  }

  if (
    card.type === 'maintenance'
  ) {
    return `Fix ${card.payload.title}`;
  }

  return card.payload.title;
}

export function getCardContext(
  card: DuoCard
) {
  if (card.type === 'transport') {
    return `${card.payload.from} → ${card.payload.to}`;
  }

  if (card.type === 'pay') {
    return `${card.payload.amount} → ${card.payload.recipient}`;
  }

  if (card.type === 'acquire') {
    return `${card.payload.source} · ${card.payload.quantity}`;
  }

  if (
    card.type === 'appointment'
  ) {
    return `${card.payload.location} · ${card.payload.time}`;
  }

  if (
    card.type === 'maintenance'
  ) {
    return `${card.payload.location}`;
  }

  return '';
}

export function getTemplateLabel(
  type: DuoCard['type']
) {
  if (type === 'transport') {
    return 'Transport';
  }

  if (type === 'pay') {
    return 'Pay';
  }

  if (type === 'acquire') {
    return 'Acquire';
  }

  if (
    type === 'appointment'
  ) {
    return 'Appointment';
  }

  if (
    type === 'maintenance'
  ) {
    return 'Maintenance';
  }

  return '';
}