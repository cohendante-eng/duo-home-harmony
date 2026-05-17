import React from 'react';

import {
  inputStyle,
  secondaryButtonStyle,
} from '../../styles/ui';

type Props = {
  showTime: boolean;

  setShowTime: (
    value: boolean
  ) => void;

  dateValue: string;

  setDateValue: (
    value: string
  ) => void;

  timeValue: string;

  setTimeValue: (
    value: string
  ) => void;
};

export default function TimeSection({
  showTime,
  setShowTime,

  dateValue,
  setDateValue,

  timeValue,
  setTimeValue,
}: Props) {
  return (
    <div
      style={{
        marginTop: 8,

        marginBottom: 28,
      }}
    >
      <button
        onClick={() =>
          setShowTime(
            !showTime
          )
        }
        style={
          secondaryButtonStyle
        }
      >
        {showTime
          ? 'Remove time'
          : 'Add time'}
      </button>

      {showTime && (
        <div
          style={{
            marginTop: 14,

            display: 'flex',

            flexDirection:
              'column',

            gap: 12,
          }}
        >
          <input
            type="date"
            style={inputStyle}
            value={dateValue}
            onChange={(e) =>
              setDateValue(
                e.target.value
              )
            }
          />

          <input
            type="time"
            style={inputStyle}
            value={timeValue}
            onChange={(e) =>
              setTimeValue(
                e.target.value
              )
            }
          />
        </div>
      )}
    </div>
  );
}