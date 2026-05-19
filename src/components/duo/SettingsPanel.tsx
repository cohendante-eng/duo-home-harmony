import {
  X,
} from 'lucide-react';

import {
  usePartner,
} from '../../store/usePartner';

import {
  useAuth,
} from '../../hooks/useAuth';

type Props = {
  onClose: () => void;
};

export default function SettingsPanel({
  onClose,
}: Props) {
  const {
    email,
    signOut,
  } = useAuth();

  const status =
    usePartner(
      (s) => s.status
    );

  const partnerName =
    usePartner(
      (s) => s.partnerName
    );

  const partnerEmail =
    usePartner(
      (s) => s.partnerEmail
    );

  const invitePartner =
    usePartner(
      (s) => s.invitePartner
    );

  const connectMockPartner =
    usePartner(
      (s) => s.connectMockPartner
    );

  const disconnectPartner =
    usePartner(
      (s) => s.disconnectPartner
    );

  const isNotConnected =
    status === 'not_connected';

  const isPending =
    status === 'pending';

  const isConnected =
    status === 'connected';

  async function handleSignOut() {
    await signOut();

    onClose();
  }

  return (
    <div
      style={{
        position: 'fixed',

        inset: 0,

        background: '#fff',

        zIndex: 100,

        padding: 24,

        display: 'flex',

        flexDirection:
          'column',
      }}
    >
      <div
        style={{
          display: 'flex',

          justifyContent:
            'space-between',

          alignItems:
            'center',

          marginBottom: 34,
        }}
      >
        <div
          style={{
            fontSize: 28,

            fontWeight: 700,
          }}
        >
          Settings
        </div>

        <button
          onClick={onClose}
          style={{
            width: 36,

            height: 36,

            borderRadius: 999,

            border:
              '1px solid rgba(0,0,0,0.06)',

            background:
              '#fff',

            display: 'flex',

            alignItems:
              'center',

            justifyContent:
              'center',

            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div
        style={{
          display: 'flex',

          flexDirection:
            'column',

          gap: 18,
        }}
      >
        <section
          style={{
            padding: 16,

            borderRadius: 18,

            border:
              '1px solid rgba(0,0,0,0.06)',

            background:
              '#fff',
          }}
        >
          <div
            style={{
              fontSize: 12,

              fontWeight: 700,

              letterSpacing: 0.8,

              textTransform:
                'uppercase',

              opacity: 0.45,

              marginBottom: 10,
            }}
          >
            Partner connection
          </div>

          {isNotConnected && (
            <>
              <div
                style={{
                  fontSize: 16,

                  fontWeight: 600,

                  marginBottom: 6,
                }}
              >
                Not connected yet
              </div>

              <div
                style={{
                  fontSize: 13,

                  color: '#777',

                  lineHeight: 1.45,

                  marginBottom: 16,
                }}
              >
                Invite one household partner to share responsibilities.
              </div>

              <button
                onClick={
                  invitePartner
                }
                style={{
                  height: 44,

                  padding:
                    '0 16px',

                  borderRadius: 14,

                  border: 'none',

                  background:
                    '#111',

                  color: '#fff',

                  fontWeight: 600,

                  cursor: 'pointer',
                }}
              >
                Invite partner
              </button>
            </>
          )}

          {isPending && (
            <>
              <div
                style={{
                  fontSize: 16,

                  fontWeight: 600,

                  marginBottom: 6,
                }}
              >
                Invite pending
              </div>

              <div
                style={{
                  fontSize: 13,

                  color: '#777',

                  lineHeight: 1.45,

                  marginBottom: 16,
                }}
              >
                Waiting for{' '}
                {partnerEmail}
                {' '}to accept the connection.
              </div>

              <div
                style={{
                  display: 'flex',

                  gap: 10,
                }}
              >
                <button
                  onClick={
                    connectMockPartner
                  }
                  style={{
                    height: 44,

                    padding:
                      '0 16px',

                    borderRadius: 14,

                    border: 'none',

                    background:
                      '#111',

                    color: '#fff',

                    fontWeight: 600,

                    cursor:
                      'pointer',
                  }}
                >
                  Simulate accept
                </button>

                <button
                  onClick={
                    disconnectPartner
                  }
                  style={{
                    height: 44,

                    padding:
                      '0 16px',

                    borderRadius: 14,

                    border:
                      '1px solid rgba(0,0,0,0.08)',

                    background:
                      '#fff',

                    color: '#777',

                    fontWeight: 600,

                    cursor:
                      'pointer',
                  }}
                >
                  Cancel invite
                </button>
              </div>
            </>
          )}

          {isConnected && (
            <>
              <div
                style={{
                  fontSize: 16,

                  fontWeight: 600,

                  marginBottom: 6,
                }}
              >
                Connected to{' '}
                {partnerName}
              </div>

              <div
                style={{
                  fontSize: 13,

                  color: '#777',

                  lineHeight: 1.45,

                  marginBottom: 16,
                }}
              >
                Duo is paired with one household partner.
              </div>

              <button
                onClick={
                  disconnectPartner
                }
                style={{
                  height: 44,

                  padding:
                    '0 16px',

                  borderRadius: 14,

                  border:
                    '1px solid rgba(0,0,0,0.08)',

                  background:
                    '#fff',

                  color: '#777',

                  fontWeight: 600,

                  cursor: 'pointer',
                }}
              >
                Disconnect partner
              </button>
            </>
          )}
        </section>

        <section
          style={{
            padding: 16,

            borderRadius: 18,

            border:
              '1px solid rgba(0,0,0,0.06)',

            background:
              '#fff',
          }}
        >
          <div
            style={{
              fontSize: 12,

              fontWeight: 700,

              letterSpacing: 0.8,

              textTransform:
                'uppercase',

              opacity: 0.45,

              marginBottom: 10,
            }}
          >
            Notifications
          </div>

          <div
            style={{
              fontSize: 16,

              fontWeight: 600,

              marginBottom: 6,
            }}
          >
            Quiet by default
          </div>

          <div
            style={{
              fontSize: 13,

              color: '#777',

              lineHeight: 1.45,
            }}
          >
            Duo only signals responsibility changes that may need attention.
          </div>
        </section>

        <section
          style={{
            padding: 16,

            borderRadius: 18,

            border:
              '1px solid rgba(0,0,0,0.06)',

            background:
              '#fff',
          }}
        >
          <div
            style={{
              fontSize: 12,

              fontWeight: 700,

              letterSpacing: 0.8,

              textTransform:
                'uppercase',

              opacity: 0.45,

              marginBottom: 10,
            }}
          >
            Account
          </div>

          <div
            style={{
              fontSize: 16,

              fontWeight: 600,

              marginBottom: 6,
            }}
          >
            {email || 'Signed in'}
          </div>

          <div
            style={{
              fontSize: 13,

              color: '#777',

              lineHeight: 1.45,

              marginBottom: 16,
            }}
          >
            Duo uses this account to connect responsibilities to the right person.
          </div>

          <button
            onClick={
              handleSignOut
            }
            style={{
              height: 44,

              padding:
                '0 16px',

              borderRadius: 14,

              border:
                '1px solid rgba(0,0,0,0.08)',

              background:
                '#fff',

              color: '#777',

              fontWeight: 600,

              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </section>
      </div>
    </div>
  );
}