import {
    DuoCard,
    UserId,
  } from '../types/card';
  
  const ONE_HOUR =
    1000 * 60 * 60;
  
  export function isAcceptedReminderEligible(
    card: DuoCard,
    currentUser: UserId,
    now = Date.now()
  ) {
    const isOwnedByUser =
      card.ownerId === currentUser;
  
    const isActive =
      card.state === 'accepted' ||
      card.state === 'delayed';
  
    const hasDueTime =
      typeof card.dueAt ===
      'number';
  
    const reminderAlreadySent =
      typeof card.reminderSentAt ===
      'number';
  
    if (
      !isOwnedByUser ||
      !isActive ||
      !hasDueTime ||
      reminderAlreadySent
    ) {
      return false;
    }
  
    const timeUntilDue =
      card.dueAt - now;
  
    return (
      timeUntilDue > 0 &&
      timeUntilDue <= ONE_HOUR
    );
  }
  
  export function getAcceptedReminderEligibleCards(
    cards: DuoCard[],
    currentUser: UserId,
    now = Date.now()
  ) {
    return cards.filter((card) =>
      isAcceptedReminderEligible(
        card,
        currentUser,
        now
      )
    );
  }