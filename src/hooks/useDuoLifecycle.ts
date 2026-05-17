import {
    useEffect,
  } from 'react';
  
  import {
    useCards,
  } from '../store/useCards';
  
  import {
    getAcceptedReminderEligibleCards,
  } from '../lib/duoViews';
  
  export function useDuoLifecycle() {
    const activeCards =
      useCards((s) => s.activeCards);
  
    const currentUser =
      useCards((s) => s.currentUser);
  
    const expireOverdueRequestedCards =
      useCards(
        (s) =>
          s.expireOverdueRequestedCards
      );
  
    const markReminderSent =
      useCards(
        (s) => s.markReminderSent
      );
  
    const showToast =
      useCards(
        (s) => s.showToast
      );
  
    useEffect(() => {
      expireOverdueRequestedCards();
    }, [
      activeCards,
      expireOverdueRequestedCards,
    ]);
  
    useEffect(() => {
      const interval =
        window.setInterval(() => {
          expireOverdueRequestedCards();
        }, 1000 * 60);
  
      return () => {
        window.clearInterval(
          interval
        );
      };
    }, [
      expireOverdueRequestedCards,
    ]);
  
    useEffect(() => {
      const eligibleCards =
        getAcceptedReminderEligibleCards(
          activeCards,
          currentUser
        );
  
      if (
        eligibleCards.length === 0
      ) {
        return;
      }
  
      const firstCard =
        eligibleCards[0];
  
      showToast(
        'Upcoming responsibility'
      );
  
      markReminderSent(
        firstCard.id
      );
    }, [
      activeCards,
      currentUser,
      showToast,
      markReminderSent,
    ]);
  }