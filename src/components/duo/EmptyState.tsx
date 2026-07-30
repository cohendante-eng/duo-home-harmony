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
          'calc(100vh - 260px)',

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
          width: 74,

          height: 74,

          borderRadius: 26,

          background:
            'rgba(255,255,255,0.68)',

          border:
            '1px solid rgba(24,32,44,0.055)',

          boxShadow:
            '0 16px 36px rgba(31,41,55,0.065)',

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

              background: '#2f7df6',
            }}
          />

          <span
            style={{
              width: 9,

              height: 9,

              borderRadius: 999,

              background: '#75a7ff',
            }}
          />

          <span
            style={{
              width: 9,

              height: 9,

              borderRadius: 999,

              background: '#75a7ff',
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

          fontWeight: 820,

          color: '#253041',

          letterSpacing: -0.25,

          marginBottom: 8,
        }}
      >
        {title}
      </div>

      <div
        style={{
          maxWidth: 280,

          fontSize: 14,

          lineHeight: 1.55,

          color: '#8a94a3',

          fontWeight: 600,
        }}
      >
        {description}
      </div>
    </div>
  );
}