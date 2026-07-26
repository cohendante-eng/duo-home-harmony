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

import {
  useSupabaseCardsRealtime,
} from '../hooks/useSupabaseCardsRealtime';

type Tab =
  | 'main'
  | 'created'
  | 'history';

export default function Index() {
  useDuoLifecycle();

  usePartnerSync();

  useSupabaseCardsSync();

  useSupabaseCardsRealtime();

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

  const toast =
    useCards((s) => s.toast);

  const hideToast =
    useCards((s) => s.hideToast);

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

  function handleToastClick() {
    if (toast.undoAction) {
      return;
    }

    if (!toast.cardId) {
      return;
    }

    const cardExists =
      activeCards.some(
        (card) =>
          card.id === toast.cardId
      );

    if (!cardExists) {
      hideToast();

      return;
    }

    setTab('main');

    setSettingsOpen(false);

    setCreateOpen(false);

    setSelectedId(toast.cardId);

    hideToast();
  }

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
    <>
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

      {toast.visible && (
        <div
          style={{
            position: 'fixed',

            left: 16,

            right: 16,

            bottom: 92,

            zIndex: 200,

            maxWidth: 520,

            margin: '0 auto',

            display: 'flex',

            alignItems: 'center',

            justifyContent:
              'space-between',

            gap: 12,

            padding:
              '14px 16px',

            borderRadius: 18,

            background: '#111',

            color: '#fff',

            boxShadow:
              '0 18px 50px rgba(0,0,0,0.24)',
          }}
        >
          <button
            onClick={
              handleToastClick
            }
            disabled={
              !toast.cardId ||
              Boolean(toast.undoAction)
            }
            style={{
              flex: 1,

              border: 'none',

              background:
                'transparent',

              color: '#fff',

              padding: 0,

              textAlign: 'left',

              fontSize: 14,

              fontWeight: 600,

              lineHeight: 1.35,

              cursor:
                toast.cardId &&
                !toast.undoAction
                  ? 'pointer'
                  : 'default',
            }}
          >
            {toast.message}
          </button>

          {toast.cardId &&
            !toast.undoAction && (
              <button
                onClick={
                  handleToastClick
                }
                style={{
                  height: 34,

                  padding:
                    '0 12px',

                  borderRadius: 999,

                  border:
                    '1px solid rgba(255,255,255,0.18)',

                  background:
                    'rgba(255,255,255,0.1)',

                  color: '#fff',

                  fontSize: 13,

                  fontWeight: 700,

                  cursor:
                    'pointer',
                }}
              >
                Open
              </button>
            )}

          {toast.undoAction && (
            <button
              onClick={
                toast.undoAction
              }
              style={{
                height: 34,

                padding:
                  '0 12px',

                borderRadius: 999,

                border:
                  '1px solid rgba(255,255,255,0.18)',

                background:
                  'rgba(255,255,255,0.1)',

                color: '#fff',

                fontSize: 13,

                fontWeight: 700,

                cursor:
                  'pointer',
              }}
            >
              Undo
            </button>
          )}

          <button
            onClick={
              hideToast
            }
            style={{
              width: 28,

              height: 28,

              borderRadius: 999,

              border: 'none',

              background:
                'rgba(255,255,255,0.1)',

              color: '#fff',

              fontSize: 18,

              lineHeight: 1,

              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}