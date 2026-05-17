type Props = {
  payload: any;

  setPayload: (
    payload: any
  ) => void;
};

export default function AcquireFields({
  payload,

  setPayload,
}: Props) {
  return (
    <>
      <input
        placeholder="Item"
        value={
          payload.item || ''
        }
        onChange={(e) =>
          setPayload({
            ...payload,

            item:
              e.target.value,
          })
        }
        style={inputStyle}
      />

      <input
        placeholder="Source"
        value={
          payload.source || ''
        }
        onChange={(e) =>
          setPayload({
            ...payload,

            source:
              e.target.value,
          })
        }
        style={inputStyle}
      />

      <input
        placeholder="Quantity"
        value={
          payload.quantity ||
          ''
        }
        onChange={(e) =>
          setPayload({
            ...payload,

            quantity:
              e.target.value,
          })
        }
        style={inputStyle}
      />
    </>
  );
}

const inputStyle = {
  height: 52,

  borderRadius: 16,

  border:
    '1px solid rgba(0,0,0,0.08)',

  padding: '0 16px',

  fontSize: 16,
};