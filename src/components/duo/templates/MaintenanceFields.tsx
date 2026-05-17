type Props = {
  payload: any;

  setPayload: (
    payload: any
  ) => void;
};

export default function MaintenanceFields({
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
        placeholder="Location"
        value={
          payload.location ||
          ''
        }
        onChange={(e) =>
          setPayload({
            ...payload,

            location:
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