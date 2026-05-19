import {
  UserCircle,
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
      }}
    >
      <button
        onClick={
          onOpenSettings
        }
        style={{
          width: 36,

          height: 36,

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
        }}
      >
        <UserCircle
          size={20}
        />
      </button>

      <div
        style={{
          maxWidth: 220,

          overflow: 'hidden',

          whiteSpace: 'nowrap',

          textOverflow: 'ellipsis',

          fontSize: 13,

          color: '#999',

          fontWeight: 600,
        }}
      >
        {email || 'Signed in'}
      </div>
    </div>
  );
}