import {
  X,
} from 'lucide-react';

import {
  useState,
} from 'react';

import {
  usePartner,
} from '../../store/usePartner';

import {
  useAuth,
} from '../../hooks/useAuth';

import {
  acceptPartnerInvitation,
  cancelPartnerInvitation,
  createPartnerInvitation,
} from '../../lib/partnerInvitations';

type Props = {
  onClose: () => void;
};

export default function SettingsPanel({
  onClose,
}: Props) {
  const {
    email,
    user,
    signOut,
  } = useAuth();

  const [inviteEmail, setInviteEmail] =
    useState('');

  const [inviteStatus, setInviteStatus] =
    useState<
      | 'idle'
      | 'sending'
      | 'accepting'
      | 'error'
    >('idle');

  const [inviteError, setInviteError] =
    useState('');

  const status =
    usePartner(
      (s) => s.status
    );

  const partner =
    usePartner(
      (s) => s.partner
    );

  const pendingInvite =
    usePartner(
      (s) => s.pendingInvite
    );

  const invitePartner =
    usePartner(
      (s) => s.invitePartner
    );

  const connectPartner =
    usePartner(
      (s) => s.connectPartner
    );

  const cancelInvite =
    usePartner(
      (s) => s.cancelInvite
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

  const isIncomingInvite =
    pendingInvite?.direction ===
    'incoming';

  const isOutgoingInvite =
    pendingInvite?.direction ===
    'outgoing';

  async function handleInvitePartner() {
    if (!user) {
      setInviteStatus('error');

      setInviteError(
        'You need to be signed in.'
      );

      return;
    }

    if (!inviteEmail.trim()) {
      setInviteStatus('error');

      setInviteError(
        'Enter your partner email.'
      );

      return;
    }

    setInviteStatus('sending');

    setInviteError('');

    try {
      const invitation =
        await createPartnerInvitation({
          inviterId: user.id,

          inviteeEmail: inviteEmail,
        });

      invitePartner(
        invitation.email,
        invitation.id,
        invitation.createdAt
      );

      setInviteEmail('');

      setInviteStatus('idle');
    } catch (error) {
      setInviteStatus('error');

      setInviteError(
        error instanceof Error
          ? error.message
          : 'Could not send invite.'
      );
    }
  }

  async function handleAcceptInvite() {
    if (
      !user ||
      !pendingInvite?.id ||
      !pendingInvite.inviterId
    ) {
      setInviteStatus('error');

      setInviteError(
        'Could not accept invite.'
      );

      return;
    }

    setInviteStatus('accepting');

    setInviteError('');

    try {
      await acceptPartnerInvitation({
        invitationId:
          pendingInvite.id,

        inviterId:
          pendingInvite.inviterId,

        currentUserId:
          user.id,
      });

      connectPartner({
        id: pendingInvite.inviterId,

        name: 'Partner',

        email: '',
      });

      setInviteStatus('idle');
    } catch (error) {
      setInviteStatus('error');

      setInviteError(
        error instanceof Error
          ? error.message
          : 'Could not accept invite.'
      );
    }
  }

  async function handleCancelInvite() {
    const invitationId =
      pendingInvite?.id;

    if (invitationId) {
      try {
        await cancelPartnerInvitation({
          invitationId,
        });
      } catch {
        // Keep local cancel usable even if backend update fails.
      }
    }

    cancelInvite();
  }

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

              <input
                type="email"
                value={inviteEmail}
                onChange={(event) => {
                  setInviteEmail(
                    event.target.value
                  );

                  setInviteStatus('idle');

                  setInviteError('');
                }}
                placeholder="Partner email"
                style={{
                  width: '100%',

                  height: 48,

                  boxSizing:
                    'border-box',

                  borderRadius: 14,

                  border:
                    '1px solid rgba(0,0,0,0.08)',

                  padding:
                    '0 14px',

                  fontSize: 15,

                  outline: 'none',

                  marginBottom: 12,
                }}
              />

              <button
                onClick={
                  handleInvitePartner
                }
                disabled={
                  inviteStatus ===
                  'sending'
                }
                style={{
                  height: 44,

                  padding:
                    '0 16px',

                  borderRadius: 14,

                  border: 'none',

                  background:
                    inviteStatus ===
                    'sending'
                      ? 'rgba(0,0,0,0.18)'
                      : '#111',

                  color: '#fff',

                  fontWeight: 600,

                  cursor:
                    inviteStatus ===
                    'sending'
                      ? 'default'
                      : 'pointer',
                }}
              >
                {inviteStatus ===
                'sending'
                  ? 'Sending invite'
                  : 'Invite partner'}
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
                {isIncomingInvite
                  ? 'Invite received'
                  : 'Invite pending'}
              </div>

              <div
                style={{
                  fontSize: 13,

                  color: '#777',

                  lineHeight: 1.45,

                  marginBottom: 16,
                }}
              >
                {isIncomingInvite
                  ? 'A household partner invited you to connect on Duo.'
                  : `Waiting for ${
                      pendingInvite?.email ??
                      'partner'
                    } to accept the connection.`}
              </div>

              <div
                style={{
                  display: 'flex',

                  gap: 10,
                }}
              >
                {isIncomingInvite && (
                  <button
                    onClick={
                      handleAcceptInvite
                    }
                    disabled={
                      inviteStatus ===
                      'accepting'
                    }
                    style={{
                      height: 44,

                      padding:
                        '0 16px',

                      borderRadius: 14,

                      border: 'none',

                      background:
                        inviteStatus ===
                        'accepting'
                          ? 'rgba(0,0,0,0.18)'
                          : '#111',

                      color: '#fff',

                      fontWeight: 600,

                      cursor:
                        inviteStatus ===
                        'accepting'
                          ? 'default'
                          : 'pointer',
                    }}
                  >
                    {inviteStatus ===
                    'accepting'
                      ? 'Accepting'
                      : 'Accept'}
                  </button>
                )}

                {isOutgoingInvite && (
                  <button
                    onClick={() =>
                      connectPartner({
                        id: 'mock-partner',

                        name: 'Partner',

                        email:
                          pendingInvite?.email ??
                          '',
                      })
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
                )}

                <button
                  onClick={
                    handleCancelInvite
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
                  {isIncomingInvite
                    ? 'Decline'
                    : 'Cancel invite'}
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
                {partner?.name ??
                  'Partner'}
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

              {partner?.email && (
                <div
                  style={{
                    fontSize: 13,

                    color: '#999',

                    lineHeight: 1.45,

                    marginBottom: 16,
                  }}
                >
                  {partner.email}
                </div>
              )}

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

          {inviteStatus ===
            'error' && (
            <div
              style={{
                marginTop: 12,

                fontSize: 13,

                color: '#991b1b',

                lineHeight: 1.45,
              }}
            >
              {inviteError}
            </div>
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