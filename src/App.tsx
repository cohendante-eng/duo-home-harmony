import {
  Bell,
  Check,
  Eye,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import { useCards } from './store/useCards';

import Index from './pages/Index';

import DuoMark from './components/duo/DuoMark';

import {
  duoColors,
} from './styles/ui';

const ONBOARDING_STORAGE_KEY =
  'duo_onboarding_completed_v1';

function OnboardingOverlay({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const items = [
    {
      title: 'Send a clear request',
      text: 'Create a responsibility and assign it to your partner.',
      icon: Check,
    },
    {
      title: 'Keep status obvious',
      text: 'See what is requested, accepted, delayed, done, or cancelled.',
      icon: Eye,
    },
    {
      title: 'Stay quietly in sync',
      text: 'Enable notifications so the right person gets reminded on time.',
      icon: Bell,
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999998,
        background:
          'linear-gradient(180deg, #f6f8fb 0%, #edf1f5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 22,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 430,
          borderRadius: 34,
          background:
            'rgba(255,255,255,0.94)',
          border:
            '1px solid rgba(24,32,44,0.06)',
          boxShadow:
            '0 26px 70px rgba(31,41,55,0.10)',
          padding: '28px 24px 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginBottom: 28,
          }}
        >
          <DuoMark size={36} />

          <div
            style={{
              fontSize: 24,
              fontWeight: 650,
              letterSpacing: -0.65,
              color: duoColors.text,
              lineHeight: 1,
            }}
          >
            Duo
          </div>
        </div>

        <div
          style={{
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 23,
              fontWeight: 620,
              letterSpacing: -0.45,
              color: duoColors.text,
              lineHeight: 1.22,
            }}
          >
            Share responsibilities
          </div>

          <div
            style={{
              fontSize: 23,
              fontWeight: 620,
              letterSpacing: -0.45,
              color: duoColors.text,
              lineHeight: 1.22,
              marginTop: 7,
            }}
          >
            clearly
          </div>
        </div>

        <div
          style={{
            fontSize: 13.5,
            lineHeight: 1.65,
            color: duoColors.muted,
            fontWeight: 450,
            textAlign: 'center',
            marginBottom: 26,
            padding: '0 6px',
          }}
        >
          Duo helps two people handle everyday responsibilities
          without turning everything into a conversation.
        </div>

        <div
          style={{
            borderRadius: 24,
            background:
              'rgba(250,251,253,0.96)',
            border:
              '1px solid rgba(24,32,44,0.06)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.7)',
            padding: '6px 16px',
            marginBottom: 24,
          }}
        >
          {items.map(
            (item, index) => {
              const Icon =
                item.icon;

              return (
                <div
                  key={item.title}
                  style={{
                    display: 'flex',
                    alignItems:
                      'flex-start',
                    gap: 14,
                    padding:
                      '16px 0',
                    borderBottom:
                      index ===
                      items.length - 1
                        ? 'none'
                        : '1px solid rgba(24,32,44,0.06)',
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      background:
                        'rgba(47,125,246,0.075)',
                      display: 'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      color:
                        duoColors.blue,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <Icon
                      size={22}
                      strokeWidth={2}
                    />
                  </div>

                  <div
                    style={{
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14.5,
                        fontWeight: 600,
                        color:
                          duoColors.text,
                        lineHeight: 1.3,
                        marginBottom: 4,
                      }}
                    >
                      {item.title}
                    </div>

                    <div
                      style={{
                        fontSize: 12.5,
                        lineHeight: 1.55,
                        color:
                          duoColors.muted,
                        fontWeight: 450,
                      }}
                    >
                      {item.text}
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>

        <button
          onClick={onComplete}
          style={{
            width: '100%',
            height: 54,
            borderRadius: 18,
            border: 'none',
            background:
              'linear-gradient(180deg, #273347 0%, #121b2a 100%)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 620,
            cursor: 'pointer',
            boxShadow:
              '0 14px 30px rgba(24,32,44,0.18)',
          }}
        >
          Start using Duo
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [showOnboarding, setShowOnboarding] =
    useState(false);

  const toast =
    useCards((s) => s.toast);

  const hideToast =
    useCards((s) => s.hideToast);

  useEffect(() => {
    const completed =
      window.localStorage.getItem(
        ONBOARDING_STORAGE_KEY
      );

    setShowOnboarding(
      completed !== 'true'
    );
  }, []);

  function handleCompleteOnboarding() {
    window.localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      'true'
    );

    setShowOnboarding(false);
  }

  return (
    <>
      <Index />

      {showOnboarding && (
        <OnboardingOverlay
          onComplete={
            handleCompleteOnboarding
          }
        />
      )}

      {toast.visible && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 96,
            transform:
              'translateX(-50%)',
            background:
              'rgba(20,20,20,0.94)',
            color: '#fff',
            minHeight: 44,
            borderRadius: 14,
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            zIndex: 999999,
            fontSize: 14,
            boxShadow:
              '0 10px 30px rgba(0,0,0,0.18)',
            backdropFilter:
              'blur(8px)',
          }}
        >
          <span>
            {toast.message}
          </span>

          {toast.undoAction && (
            <button
              onClick={() => {
                toast.undoAction?.();

                hideToast();
              }}
              style={{
                border: 'none',
                background:
                  'transparent',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
    </>
  );
}