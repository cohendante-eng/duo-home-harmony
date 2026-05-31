import {
  useEffect,
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

import EmptyState from '../components/duo/EmptyState';

import AuthScreen from '../components/duo/AuthScreen';

import {
  getVisibleCardsForUser,
  getCreatedCardsForUser,
  sortHomeCards,
} from '../lib/duoViews';

import {
  useDuoLifecycle,
} from '../hooks/useDuoLifecycle';

import {
  useAuth,
} from '../hooks/useAuth';

import {
  usePartnerSync,
} from '../hooks/usePartnerSync';

import {
  useSupabaseCardsSync,
} from '../hooks/useSupabaseCardsSync';

type Tab =
  | 'main'
  | 'created'
  | 'history';

export default function Index() {
  useDuoLifecycle();

  usePartnerSync();

  useSupabaseCardsSync();

  const {
    session,
    loading,
    email,
  } = useAuth();

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

  useEffect(() => {
    if (session) {
      useCards.setState({
        currentUser: 'me',
      });
    }
  }, [session]);

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

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          color: '#999',

          fontSize: 14,
        }}
      >
        Loading Duo
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

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
        email={email}
        onOpenSettings={() =>
          setSettingsOpen(true)
        }
      />

      {tab === 'main' && (
        <>
          {sortedVisibleCards.length ===
          0 ? (
            <EmptyState
              title="All good"
              description="No active responsibilities need your attention right now."
            />
          ) : (
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
        </>
      )}

      {tab === 'created' && (
        <>
          {createdCards.length === 0 ? (
            <EmptyState
              title="Nothing created"
              description="Responsibilities you create for your partner will appear here as a quiet reference."
            />
          ) : (
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
        </>
      )}

      {tab === 'history' && (
        <>
          {historyCards.length === 0 ? (
            <EmptyState
              title="No history yet"
              description="Done, cancelled, stopped, and expired responsibilities will appear here."
            />
          ) : (
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
        </>
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