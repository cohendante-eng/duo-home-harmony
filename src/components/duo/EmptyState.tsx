import type {
  ReactNode,
} from 'react';

import DuoMark from './DuoMark';

import {
  duoColors,
} from '../../styles/ui';

type Props = {
  title?: string;

  description?: string;

  children?: ReactNode;

  [key: string]: unknown;
};

export default function EmptyState({
  title = 'All good',

  description = 'No active responsibilities need your attention right now.',

  children,
}: Props) {
  return (
    <div
      style={{
        minHeight: '52vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '28px 16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 290,
        }}
      >
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: 25,
            background: 'rgba(255,255,255,0.86)',
            border: '1px solid rgba(24,32,44,0.065)',
            boxShadow:
              '0 16px 40px rgba(31,41,55,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <DuoMark size={42} />
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: -0.2,
            color: duoColors.text,
            marginBottom: 10,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 14,
            lineHeight: 1.55,
            color: duoColors.muted,
            fontWeight: 500,
          }}
        >
          {description}
        </div>

        {children && (
          <div
            style={{
              marginTop: 18,
            }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
}