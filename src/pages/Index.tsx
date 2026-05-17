import {
  useMemo,
  useState,
} from 'react';

import { useCards } from '../store/useCards';

import ResponsibilityCard from '../components/duo/ResponsibilityCard';

import CreatedCard from '../components/duo/CreatedCard';

import CreateFlow from '../components/duo/CreateFlow';

import ExpandedCard from '../components/duo/ExpandedCard';

import SettingsPanel from '../components/duo/SettingsPanel';

import BottomNav from '../components/duo/BottomNav';

import HistoryCard from '../components/duo/HistoryCard';

import TopBar from '../components/duo/TopBar';

import FloatingCreateButton from '../components/duo/FloatingCreateButton';

import {
  UserId,
} from '../types/card';

import {
  getVisibleCardsForUser,
  getCreatedCardsForUser,
  sortHomeCards,
} from '../lib/duoViews';

import {
  useDuoLifecycle,
} from '../hooks/useDuoLifecycle';

type Tab =
  | 'main'
  | 'created'
  | 'history';

export default function Index() {
  useDuoLifecycle();

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [createOpen, setCreateOpen] =
    useState(false);

  const [settingsOpen, setSettingsOpen] =
    useState(false);

  const [tab, setTab] =
    useState<Tab>('main');

  const activeCards =
    useCards((s) => s.activeCards);

  const historyCards =
    useCards((s) => s.historyCards);

  const currentUser =
    useCards((s) => s.currentUser);

  const setUser =
    useCards.setState;

  function setCurrentUser(
    user: UserId
  ) {
    setUser({
      currentUser: user,
    });
  }

  const visibleCards =
    useMemo(() => {
      return getVisibleCardsForUser(
        activeCards,
        currentUser
      );
    }, [
      activeCards,
      currentUser,
    ]);

  const createdCards =
    useMemo(() => {
      return getCreatedCardsForUser(
        activeCards,
        currentUser
      );
    }, [
      activeCards,
      currentUser,
    ]);

  const sortedVisibleCards =
    useMemo(() => {
      return sortHomeCards(
        visibleCards,
        currentUser
      );
    }, [
      visibleCards,
      currentUser,
    ]);

  const shouldShowCreateButton =
    !selectedId &&
    !createOpen &&
    !settingsOpen;

  return (
    <div
      style={{
        padding: 24,

        paddingBottom: 120,

        maxWidth: 520,

        margin: '0 auto',
      }}
    >
      <TopBar
        currentUser={currentUser}
        setCurrentUser={
          setCurrentUser
        }
        onOpenSettings={() =>
          setSettingsOpen(true)
        }
      />

      {tab === 'main' && (
        <div
          style={{
            display: 'flex',

            flexDirection:
              'column',

            gap: 10,
          }}
        >
          {sortedVisibleCards.map(
            (card) => (
              <ResponsibilityCard
                key={card.id}
                card={card}
                onOpen={(c) =>
                  setSelectedId(
                    c.id
                  )
                }
              />
            )
          )}
        </div>
      )}

      {tab === 'created' && (
        <div
          style={{
            display: 'flex',

            flexDirection:
              'column',

            gap: 10,
          }}
        >
          {createdCards.map(
            (card) => (
              <CreatedCard
                key={card.id}
                card={card}
                onOpen={(c) =>
                  setSelectedId(
                    c.id
                  )
                }
              />
            )
          )}
        </div>
      )}

      {tab === 'history' && (
        <div
          style={{
            display: 'flex',

            flexDirection:
              'column',

            gap: 10,
          }}
        >
          {historyCards.map(
            (card) => (
              <HistoryCard
                key={card.id}
                card={card}
              />
            )
          )}
        </div>
      )}

      {shouldShowCreateButton && (
        <FloatingCreateButton
          onClick={() =>
            setCreateOpen(true)
          }
        />
      )}

      <BottomNav
        tab={tab}
        setTab={setTab}
      />

      <CreateFlow
        open={createOpen}
        onClose={() =>
          setCreateOpen(false)
        }
      />

      {selectedId && (
        <ExpandedCard
          cardId={selectedId}
          onClose={() =>
            setSelectedId(null)
          }
        />
      )}

      {settingsOpen && (
        <SettingsPanel
          onClose={() =>
            setSettingsOpen(false)
          }
        />
      )}
    </div>
  );
}