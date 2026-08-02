type Props = {
    size?: number;
  };
  
  export default function DuoMark({
    size = 34,
  }: Props) {
    const scale = size / 100;
  
    return (
      <div
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 5 * scale,
            top: 4 * scale,
            width: 58 * scale,
            height: 58 * scale,
            borderRadius: `${14 * scale}px ${34 * scale}px ${34 * scale}px ${14 * scale}px`,
            background: 'rgba(157, 203, 242, 0.88)',
          }}
        />
  
        <div
          style={{
            position: 'absolute',
            left: 38 * scale,
            top: 31 * scale,
            width: 58 * scale,
            height: 58 * scale,
            borderRadius: '999px',
            background: 'rgba(73, 143, 236, 0.96)',
          }}
        />
  
        <div
          style={{
            position: 'absolute',
            left: 38 * scale,
            top: 31 * scale,
            width: 31 * scale,
            height: 31 * scale,
            borderTopLeftRadius: 30 * scale,
            borderTopRightRadius: 4 * scale,
            borderBottomRightRadius: 30 * scale,
            borderBottomLeftRadius: 4 * scale,
            background: 'rgba(10, 79, 163, 0.94)',
            transform: `rotate(-1deg)`,
          }}
        />
      </div>
    );
  }