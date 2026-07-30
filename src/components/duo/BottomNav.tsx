import {
  Home,
  Archive,
  History,
} from 'lucide-react';

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
      ? '#18202c'
      : '#98a1ad',

    display: 'flex',

    flexDirection: 'column',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 5,

    minWidth: 70,

    height: 56,

    fontSize: 11,

    fontWeight: active ? 800 : 650,

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

        top: 5,

        width: 22,

        height: 3,

        borderRadius: 999,

        background: '#18202c',
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

        bottom: 18,

        transform:
          'translateX(-50%)',

        width:
          'min(calc(100% - 32px), 488px)',

        height: 78,

        borderRadius: 25,

        border:
          '1px solid rgba(24,32,44,0.07)',

        background:
          'rgba(255,255,255,0.86)',

        boxShadow:
          '0 18px 45px rgba(31,41,55,0.12)',

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
              ? 2.5
              : 2
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
              ? 2.5
              : 2
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
              ? 2.5
              : 2
          }
        />

        History
      </button>
    </nav>
  );
}