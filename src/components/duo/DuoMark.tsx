type Props = {
  size?: number;
};

export default function DuoMark({
  size = 34,
}: Props) {
  return (
    <img
      src="/duologo.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{
        display: 'block',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    />
  );
}
