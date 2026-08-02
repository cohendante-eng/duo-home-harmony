import {
  Settings,
} from 'lucide-react';

import {
  duoColors,
} from '../../styles/ui';

import DuoMark from './DuoMark';

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
    <header
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 18,
        marginBottom: 26,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minWidth: 0,
        }}
      >
        <DuoMark size={34} />

        <div
          style={{
            fontSize: 30,
            fontWeight: 750,
            letterSpacing: -1.25,
            lineHeight: 1,
            color: duoColors.text,
          }}
        >
          Duo
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: duoColors.muted,
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 185,
            textAlign: 'right',
          }}
        >
          {getEmailLabel(email)}
        </div>

        <button
          onClick={onOpenSettings}
          aria-label="Open settings"
          style={{
            width: 44,
            height: 44,
            borderRadius: 17,
            border:
              '1px solid rgba(24,32,44,0.075)',
            background:
              'rgba(255,255,255,0.82)',
            boxShadow:
              '0 12px 28px rgba(31,41,55,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3b4655',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Settings
            size={18}
            strokeWidth={2.05}
          />
        </button>
      </div>
    </header>
  );
}