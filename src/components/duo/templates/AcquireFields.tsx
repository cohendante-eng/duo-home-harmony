import {
  inputStyle,
} from '../../../styles/ui';

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