import {
  Check,
  Bell,
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
          'linear-gradient(180deg, #f7f9fc 0%, #edf1f5 100%)',
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
            '1px solid rgba(24,32,44,0.075)',
          boxShadow:
            '0 30px 90px rgba(31,41,55,0.13)',
          padding: '28px 24px 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 34,
          }}
        >
          <DuoMark size={44} />

          <div
            style={{
              fontSize: 32,
              fontWeight: 760,
              letterSpacing: -1.1,
              color: duoColors.text,
              lineHeight: 1,
            }}
          >
            Duo
          </div>
        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 780,
            letterSpacing: -0.85,
            color: duoColors.text,
            lineHeight: 1.08,
            textAlign: 'center',
            marginBottom: 18,
            whiteSpace: 'nowrap',
          }}
        >
          Share responsibilities clearly
        </div>

        <div
          style={{
            fontSize: 15,
            lineHeight: 1.62,
            color: duoColors.muted,
            fontWeight: 500,
            textAlign: 'center',
            marginBottom: 30,
          }}
        >
          Duo helps two people handle everyday responsibilities without turning everything into a conversation.
        </div>

        <div
          style={{
            borderRadius: 26,
            background:
              'rgba(255,255,255,0.86)',
            border:
              '1px solid rgba(24,32,44,0.07)',
            boxShadow:
              '0 16px 46px rgba(31,41,55,0.055)',
            padding: '6px 20px',
            marginBottom: 28,
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
                    alignItems: 'center',
                    gap: 16,
                    padding:
                      '19px 0',
                    borderBottom:
                      index ===
                      items.length - 1
                        ? 'none'
                        : '1px solid rgba(24,32,44,0.07)',
                  }}
                >
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 20,
                      background:
                        'rgba(47,125,246,0.08)',
                      display: 'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      color:
                        duoColors.blue,
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      size={27}
                      strokeWidth={2.25}
                    />
                  </div>

                  <div
                    style={{
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 720,
                        color:
                          duoColors.text,
                        lineHeight: 1.2,
                        marginBottom: 6,
                      }}
                    >
                      {item.title}
                    </div>

                    <div
                      style={{
                        fontSize: 14,
                        lineHeight: 1.45,
                        color:
                          duoColors.muted,
                        fontWeight: 500,
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
            height: 58,
            borderRadius: 20,
            border: 'none',
            background:
              'linear-gradient(180deg, #283242 0%, #111722 100%)',
            color: '#fff',
            fontSize: 16,
            fontWeight: 720,
            cursor: 'pointer',
            boxShadow:
              '0 16px 34px rgba(24,32,44,0.18)',
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