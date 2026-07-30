import {
  Settings,
} from 'lucide-react';

type Props = {
  email?: string | null;

  onOpenSettings: () => void;
};

function getEmailLabel(
  email?: string | null
) {
  if (!email) {
    return 'Account';
  }

  return email;
}

export default function TopBar({
  email,
  onOpenSettings,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',

        alignItems: 'flex-start',

        justifyContent:
          'space-between',

        gap: 18,

        marginBottom: 28,
      }}
    >
      <div
        style={{
          minWidth: 0,

          display: 'flex',

          flexDirection: 'column',

          gap: 7,
        }}
      >
        <div
          style={{
            display: 'flex',

            alignItems: 'center',

            gap: 10,
          }}
        >
          <div
            aria-hidden="true"
            style={{
              display: 'grid',

              gridTemplateColumns:
                'repeat(2, 7px)',

              gap: 5,

              transform:
                'translateY(1px)',
            }}
          >
            <span
              style={{
                width: 7,

                height: 7,

                borderRadius: 999,

                background: '#2f7df6',
              }}
            />

            <span
              style={{
                width: 7,

                height: 7,

                borderRadius: 999,

                background: '#75a7ff',
              }}
            />

            <span
              style={{
                width: 7,

                height: 7,

                borderRadius: 999,

                background: '#75a7ff',
              }}
            />

            <span
              style={{
                width: 7,

                height: 7,

                borderRadius: 999,

                background:
                  'transparent',
              }}
            />
          </div>

          <div
            style={{
              fontSize: 28,

              fontWeight: 850,

              letterSpacing: -1.2,

              lineHeight: 1,

              color: '#18202c',
            }}
          >
            Duo
          </div>
        </div>

        <div
          style={{
            fontSize: 12,

            color: '#8a94a3',

            fontWeight: 650,

            overflow: 'hidden',

            textOverflow: 'ellipsis',

            whiteSpace: 'nowrap',

            maxWidth: 260,
          }}
        >
          {getEmailLabel(email)}
        </div>
      </div>

      <button
        onClick={onOpenSettings}
        aria-label="Open settings"
        style={{
          width: 42,

          height: 42,

          borderRadius: 16,

          border:
            '1px solid rgba(24, 32, 44, 0.075)',

          background:
            'rgba(255,255,255,0.82)',

          boxShadow:
            '0 10px 26px rgba(31,41,55,0.06)',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          color: '#3b4655',

          cursor: 'pointer',
        }}
      >
        <Settings size={18} />
      </button>
    </div>
  );
}