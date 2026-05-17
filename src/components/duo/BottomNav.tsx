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
  
  export default function BottomNav({
    tab,
    setTab,
  }: Props) {
    return (
      <div
        style={{
          position: 'fixed',
  
          left: 0,
  
          right: 0,
  
          bottom: 0,
  
          height: 82,
  
          background:
            'rgba(255,255,255,0.96)',
  
          backdropFilter:
            'blur(20px)',
  
          borderTop:
            '1px solid rgba(0,0,0,0.06)',
  
          display: 'flex',
  
          alignItems: 'center',
  
          justifyContent:
            'space-around',
  
          paddingBottom: 10,
  
          zIndex: 50,
        }}
      >
        <button
          onClick={() =>
            setTab('main')
          }
          style={{
            border: 'none',
  
            background: 'none',
  
            display: 'flex',
  
            flexDirection:
              'column',
  
            alignItems:
              'center',
  
            gap: 4,
  
            opacity:
              tab === 'main'
                ? 1
                : 0.4,
  
            fontSize: 11,
  
            fontWeight:
              tab === 'main'
                ? 700
                : 500,
  
            cursor: 'pointer',
          }}
        >
          <Home size={18} />
  
          Home
        </button>
  
        <button
          onClick={() =>
            setTab('created')
          }
          style={{
            border: 'none',
  
            background: 'none',
  
            display: 'flex',
  
            flexDirection:
              'column',
  
            alignItems:
              'center',
  
            gap: 4,
  
            opacity:
              tab === 'created'
                ? 1
                : 0.4,
  
            fontSize: 11,
  
            fontWeight:
              tab === 'created'
                ? 700
                : 500,
  
            cursor: 'pointer',
          }}
        >
          <Archive size={18} />
  
          Created
        </button>
  
        <button
          onClick={() =>
            setTab('history')
          }
          style={{
            border: 'none',
  
            background: 'none',
  
            display: 'flex',
  
            flexDirection:
              'column',
  
            alignItems:
              'center',
  
            gap: 4,
  
            opacity:
              tab === 'history'
                ? 1
                : 0.4,
  
            fontSize: 11,
  
            fontWeight:
              tab === 'history'
                ? 700
                : 500,
  
            cursor: 'pointer',
          }}
        >
          <History size={18} />
  
          History
        </button>
      </div>
    );
  }