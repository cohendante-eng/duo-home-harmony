type Props = {
  payload: any;

  setPayload: (
    payload: any
  ) => void;
};

export default function PayFields({
  payload,

  setPayload,
}: Props) {
  return (
    <>
      <input
        placeholder="Title"
        value={
          payload.title || ''
        }
        onChange={(e) =>
          setPayload({
            ...payload,

            title:
              e.target.value,
          })
        }
        style={inputStyle}
      />

      <input
        placeholder="Amount"
        value={
          payload.amount || ''
        }
        onChange={(e) =>
          setPayload({
            ...payload,

            amount:
              e.target.value,
          })
        }
        style={inputStyle}
      />

      <input
        placeholder="Recipient"
        value={
          payload.recipient ||
          ''
        }
        onChange={(e) =>
          setPayload({
            ...payload,

            recipient:
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