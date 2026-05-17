import {
  DuoCard,
  UserId,
} from '../types/card';

const ONE_HOUR =
  1000 * 60 * 60;

export function getVisibleCardsForUser(
  cards: DuoCard[],
  currentUser: UserId
) {
  return cards.filter((card) => {
    const isMine =
      card.ownerId === currentUser;

    const surfacedToMe =
      card.modifierFor ===
        currentUser &&
      (card.modifier ===
        'updated' ||
        card.modifier ===
          'returned');

    return (
      isMine ||
      surfacedToMe
    );
  });
}

export function getCreatedCardsForUser(
  cards: DuoCard[],
  currentUser: UserId
) {
  return cards.filter(
    (card) =>
      card.creatorId ===
        currentUser &&
      card.ownerId !==
        currentUser
  );
}

export function sortHomeCards(
  cards: DuoCard[],
  currentUser: UserId
) {
  return [...cards].sort((a, b) => {
    function getPriority(
      card: DuoCard
    ) {
      const isMine =
        card.ownerId ===
        currentUser;

      const isReturned =
        card.modifier ===
        'returned';

      const isSurfaced =
        !isMine &&
        card.modifierFor ===
          currentUser;

      if (
        isMine &&
        card.state ===
          'requested'
      ) {
        return 0;
      }

      if (
        isMine &&
        card.state ===
          'accepted'
      ) {
        return 1;
      }

      if (
        isMine &&
        card.state ===
          'delayed'
      ) {
        return 2;
      }

      if (
        isSurfaced &&
        !isReturned
      ) {
        return 3;
      }

      if (
        isSurfaced &&
        isReturned
      ) {
        return 4;
      }

      return 100;
    }

    const aPriority =
      getPriority(a);

    const bPriority =
      getPriority(b);

    if (
      aPriority !==
      bPriority
    ) {
      return (
        aPriority -
        bPriority
      );
    }

    const aTime =
      a.dueAt || 0;

    const bTime =
      b.dueAt || 0;

    return aTime - bTime;
  });
}

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