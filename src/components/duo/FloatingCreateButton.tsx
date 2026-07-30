import {
  Plus,
} from 'lucide-react';

type Props = {
  onClick: () => void;
};

export default function FloatingCreateButton({
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      aria-label="Create responsibility"
      style={{
        position: 'fixed',

        right: 'max(22px, calc((100vw - 520px) / 2 + 22px))',

        bottom: 112,

        width: 62,

        height: 62,

        borderRadius: 999,

        border:
          '1px solid rgba(255,255,255,0.34)',

        background:
          'linear-gradient(180deg, #283242 0%, #111722 100%)',

        color: '#fff',

        boxShadow:
          '0 18px 42px rgba(17, 24, 39, 0.26), 0 5px 12px rgba(17, 24, 39, 0.16)',

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'center',

        cursor: 'pointer',

        zIndex: 35,
      }}
    >
      <Plus
        size={30}
        strokeWidth={2.4}
      />
    </button>
  );
}