import {
  Settings,
} from 'lucide-react';

type Props = {
  email: string | null;

  onOpenSettings: () => void;
};

export default function TopBar({
  email,
  onOpenSettings,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',

        justifyContent:
          'space-between',

        alignItems: 'center',

        marginBottom: 28,

        gap: 16,
      }}
    >
      <div
        style={{
          minWidth: 0,

          flex: 1,
        }}
      >
        <div
          style={{
            fontSize: 11,

            color: '#bbb',

            fontWeight: 800,

            letterSpacing: 0.45,

            textTransform:
              'uppercase',

            marginBottom: 4,
          }}
        >
          Account
        </div>

        <div
          style={{
            maxWidth: '100%',

            overflow: 'hidden',

            whiteSpace: 'nowrap',

            textOverflow: 'ellipsis',

            fontSize: 13,

            color: '#999',

            fontWeight: 650,
          }}
        >
          {email || 'Signed in'}
        </div>
      </div>

      <button
        onClick={
          onOpenSettings
        }
        aria-label="Open settings"
        title="Settings"
        style={{
          width: 38,

          height: 38,

          borderRadius: 999,

          border:
            '1px solid rgba(0,0,0,0.06)',

          background: '#fff',

          display: 'flex',

          alignItems: 'center',

          justifyContent:
            'center',

          color: '#777',

          cursor: 'pointer',

          flexShrink: 0,
        }}
      >
        <Settings
          size={19}
        />
      </button>
    </div>
  );
}
