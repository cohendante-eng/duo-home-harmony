import {
  inputStyle,
} from '../../../styles/ui';

type Props = {
  payload: any;

  setPayload: (
    payload: any
  ) => void;
};

export default function AppointmentFields({
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