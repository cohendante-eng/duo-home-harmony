import {
  duoColors,
} from '../../styles/ui';

type Props = {
  title: string;

  description: string;
};

export default function EmptyState({
  title,
  description,
}: Props) {
  return (
    <div
      style={{
        minHeight:
          'calc(100vh - 275px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 22px',
      }}
    >
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: 27,
          background:
            'rgba(255,255,255,0.74)',
          border:
            '1px solid rgba(24,32,44,0.06)',
          boxShadow:
            '0 16px 36px rgba(31,41,55,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(2, 9px)',
            gap: 6,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 999,
              background:
                duoColors.blue,
            }}
          />

          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 999,
              background:
                '#82b0ff',
            }}
          />

          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 999,
              background:
                '#82b0ff',
            }}
          />

          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 999,
              background:
                'transparent',
            }}
          />
        </div>
      </div>

      <div
        style={{
          fontSize: 18,
          fontWeight: 650,
          color: duoColors.text,
          letterSpacing: -0.25,
          marginBottom: 8,
        }}
      >
        {title}
      </div>

      <div
        style={{
          maxWidth: 286,
          fontSize: 14,
          lineHeight: 1.55,
          color: duoColors.muted,
          fontWeight: 500,
        }}
      >
        {description}
      </div>
    </div>
  );
}