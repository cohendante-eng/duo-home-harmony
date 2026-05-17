import { useCards } from './store/useCards';

import Index from './pages/Index';

export default function App() {
  const toast =
    useCards((s) => s.toast);

  const hideToast =
    useCards((s) => s.hideToast);

  return (
    <>
      <Index />

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

            padding:
              '0 14px',

            display: 'flex',

            alignItems:
              'center',

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

                cursor:
                  'pointer',
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