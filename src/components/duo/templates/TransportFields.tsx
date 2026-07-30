import {
  inputStyle,
} from '../../../styles/ui';

type Props = {
  payload: any;

  setPayload: (
    payload: any
  ) => void;
};

export default function TransportFields({
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
        placeholder="From"
        value={
          payload.from || ''
        }
        onChange={(e) =>
          setPayload({
            ...payload,

            from:
              e.target.value,
          })
        }
        style={inputStyle}
      />

      <input
        placeholder="To"
        value={
          payload.to || ''
        }
        onChange={(e) =>
          setPayload({
            ...payload,

            to:
              e.target.value,
          })
        }
        style={inputStyle}
      />
    </>
  );
}