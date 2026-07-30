import {
  Home,
  Archive,
  History,
} from 'lucide-react';

import {
  duoColors,
} from '../../styles/ui';

type Tab =
  | 'main'
  | 'created'
  | 'history';

type Props = {
  tab: Tab;

  setTab: (tab: Tab) => void;
};

function getNavItemStyle(
  active: boolean
): React.CSSProperties {
  return {
    border: 'none',
    background: 'transparent',
    color: active
      ? duoColors.text
      : '#9aa4b2',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    minWidth: 72,
    height: 58,
    fontSize: 11,
    fontWeight: active ? 650 : 500,
    cursor: 'pointer',
    position: 'relative',
  };
}

function ActiveDot({
  show,
}: {
  show: boolean;
}) {
  if (!show) return null;

  return (
    <span
      style={{
        position: 'absolute',
        top: 4,
        width: 22,
        height: 3,
        borderRadius: 999,
        background: duoColors.text,
      }}
    />
  );
}

export default function BottomNav({
  tab,
  setTab,
}: Props) {
  return (
    <nav
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 16,
        transform:
          'translateX(-50%)',
        width:
          'min(calc(100% - 28px), 492px)',
        height: 78,
        borderRadius: 26,
        border:
          '1px solid rgba(24,32,44,0.075)',
        background:
          'rgba(255,255,255,0.88)',
        boxShadow:
          '0 18px 48px rgba(31,41,55,0.13)',
        backdropFilter:
          'blur(18px)',
        WebkitBackdropFilter:
          'blur(18px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent:
          'space-around',
        zIndex: 40,
      }}
    >
      <button
        onClick={() =>
          setTab('main')
        }
        style={getNavItemStyle(
          tab === 'main'
        )}
      >
        <ActiveDot
          show={tab === 'main'}
        />

        <Home
          size={20}
          strokeWidth={
            tab === 'main'
              ? 2.35
              : 1.9
          }
        />

        Home
      </button>

      <button
        onClick={() =>
          setTab('created')
        }
        style={getNavItemStyle(
          tab === 'created'
        )}
      >
        <ActiveDot
          show={tab === 'created'}
        />

        <Archive
          size={20}
          strokeWidth={
            tab === 'created'
              ? 2.35
              : 1.9
          }
        />

        Created
      </button>

      <button
        onClick={() =>
          setTab('history')
        }
        style={getNavItemStyle(
          tab === 'history'
        )}
      >
        <ActiveDot
          show={tab === 'history'}
        />

        <History
          size={20}
          strokeWidth={
            tab === 'history'
              ? 2.35
              : 1.9
          }
        />

        History
      </button>
    </nav>
  );
}