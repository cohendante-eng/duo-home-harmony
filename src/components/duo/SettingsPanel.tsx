import {
  X,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  usePartner,
} from '../../store/usePartner';

import {
  useCards,
} from '../../store/useCards';

import {
  useAuth,
} from '../../hooks/useAuth';

import {
  acceptPartnerInvitation,
  cancelPartnerInvitation,
  createPartnerInvitation,
  getLatestIncomingPartnerInvitation,
  getLatestOutgoingPartnerInvitation,
} from '../../lib/partnerInvitations';

import {
  disconnectPartnerConnection,
  getActivePartnerConnection,
} from '../../lib/partnerConnections';

import {
  getPushPermissionStatus,
  isPushNotificationSupported,
  registerPushNotifications,
  unregisterPushNotifications,
} from '../../lib/pushNotifications';

import {
  formatReminderLeadTime,
  getReminderLeadTimeMinutes,
  REMINDER_LEAD_TIME_OPTIONS,
  ReminderLeadTimeMinutes,
  setReminderLeadTimeMinutes,
} from '../../lib/reminderPreferences';

import {
  cardSurfaceStyle,
  duoColors,
  inputStyle,
  panelInnerStyle,
  panelScreenStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from '../../styles/ui';

type Props = {
  onClose: () => void;
};

function clearRuntimeCards() {
  useCards.setState({
    activeCards: [],
    historyCards: [],
  });
}

function closeButtonStyle():
  React.CSSProperties {
  return {
    width: 44,
    height: 44,
    borderRadius: 17,
    border:
      '1px solid rgba(24,32,44,0.075)',
    background:
      'rgba(255,255,255,0.84)',
    boxShadow:
      '0 12px 28px rgba(31,41,55,0.07)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: duoColors.text,
  };
}

function SectionTitle({
  label,
}: {
  label: string;
}) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 650,
        letterSpacing: 0.7,
        textTransform: 'uppercase',
        color: duoColors.softMuted,
        marginBottom: 12,
      }}
    >
      {label}
    </div>
  );
}

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

  const [disconnectStatus, setDisconnectStatus] =
    useState<
      | 'idle'
      | 'disconnecting'
      | 'error'
    >('idle');

  const [disconnectError, setDisconnectError] =
    useState('');

  const [notificationStatus, setNotificationStatus] =
    useState<
      | 'idle'
      | 'requesting'
      | 'enabled'
      | 'disabled'
      | 'blocked'
      | 'unsupported'
      | 'missing-public-key'
      | 'error'
    >('idle');

  const [notificationError, setNotificationError] =
    useState('');

  const [
    reminderLeadTime,
    setReminderLeadTime,
  ] =
    useState<ReminderLeadTimeMinutes>(
      () =>
        getReminderLeadTimeMinutes()
    );

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

  const setPendingInvite =
    usePartner(
      (s) => s.setPendingInvite
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

  const refreshNotificationStatus =
    useCallback(() => {
      if (
        !isPushNotificationSupported()
      ) {
        setNotificationStatus(
          'unsupported'
        );

        return;
      }

      const permission =
        getPushPermissionStatus();

      if (permission === 'denied') {
        setNotificationStatus(
          'blocked'
        );

        return;
      }

      if (permission === 'granted') {
        setNotificationStatus(
          'enabled'
        );

        return;
      }

      setNotificationStatus(
        'disabled'
      );
    }, []);

  const refreshPartnerState =
    useCallback(async () => {
      if (!user || !email) {
        return;
      }

      const activeConnection =
        await getActivePartnerConnection({
          userId: user.id,
        });

      if (activeConnection) {
        const currentPartner =
          usePartner
            .getState()
            .partner;

        const shouldUpdatePartner =
          currentPartner?.connectionId !==
            activeConnection.id ||
          currentPartner?.email !==
            activeConnection.partnerEmail;

        if (shouldUpdatePartner) {
          connectPartner({
            id: activeConnection.partnerId,
            connectionId:
              activeConnection.id,
            name: 'Partner',
            email:
              activeConnection.partnerEmail,
          });
        }

        return;
      }

      const partnerState =
        usePartner.getState();

      if (
        partnerState.status ===
          'connected' ||
        partnerState.partner
      ) {
        disconnectPartner();

        clearRuntimeCards();
      }

      const incoming =
        await getLatestIncomingPartnerInvitation({
          email,
        });

      if (incoming) {
        const currentInvite =
          usePartner
            .getState()
            .pendingInvite;

        if (
          currentInvite?.id !==
          incoming.id
        ) {
          setPendingInvite({
            id: incoming.id,
            direction:
              incoming.direction,
            inviterId:
              incoming.inviterId,
            inviterEmail:
              incoming.inviterEmail,
            email:
              incoming.email,
            createdAt:
              incoming.createdAt,
          });
        }

        return;
      }

      const outgoing =
        await getLatestOutgoingPartnerInvitation({
          userId: user.id,
        });

      if (outgoing) {
        const currentInvite =
          usePartner
            .getState()
            .pendingInvite;

        if (
          currentInvite?.id !==
          outgoing.id
        ) {
          setPendingInvite({
            id: outgoing.id,
            direction:
              outgoing.direction,
            inviterId:
              outgoing.inviterId,
            inviterEmail:
              outgoing.inviterEmail,
            email:
              outgoing.email,
            createdAt:
              outgoing.createdAt,
          });
        }

        return;
      }

      if (
        usePartner
          .getState()
          .status === 'pending'
      ) {
        cancelInvite();
      }
    }, [
      user,
      email,
      connectPartner,
      disconnectPartner,
      setPendingInvite,
      cancelInvite,
    ]);

  useEffect(() => {
    refreshNotificationStatus();
  }, [
    refreshNotificationStatus,
  ]);

  useEffect(() => {
    refreshPartnerState().catch(
      () => {
        // Keep Settings quiet for now.
      }
    );
  }, [
    refreshPartnerState,
  ]);

  useEffect(() => {
    if (!user || !email) {
      return;
    }

    const interval =
      window.setInterval(() => {
        refreshPartnerState().catch(
          () => {
            // Keep Settings quiet for now.
          }
        );
      }, 1000 * 3);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    user,
    email,
    refreshPartnerState,
  ]);

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

  async function handleEnableNotifications() {
    setNotificationStatus(
      'requesting'
    );

    setNotificationError('');

    try {
      const result =
        await registerPushNotifications();

      if (result === 'subscribed') {
        setNotificationStatus(
          'enabled'
        );

        return;
      }

      if (
        result === 'unsupported'
      ) {
        setNotificationStatus(
          'unsupported'
        );

        return;
      }

      if (
        result ===
        'missing-public-key'
      ) {
        setNotificationStatus(
          'missing-public-key'
        );

        setNotificationError(
          'Missing VITE_VAPID_PUBLIC_KEY in this deployment.'
        );

        return;
      }

      if (
        result === 'blocked'
      ) {
        setNotificationStatus(
          'blocked'
        );

        return;
      }

      setNotificationStatus(
        'disabled'
      );
    } catch (error) {
      setNotificationStatus(
        'error'
      );

      setNotificationError(
        error instanceof Error
          ? error.message
          : 'Could not enable notifications.'
      );
    }
  }

  async function handleDisableNotifications() {
    setNotificationError('');

    try {
      await unregisterPushNotifications();

      setNotificationStatus(
        'disabled'
      );
    } catch (error) {
      setNotificationStatus(
        'error'
      );

      setNotificationError(
        error instanceof Error
          ? error.message
          : 'Could not disable notifications.'
      );
    }
  }

  function handleReminderLeadTimeChange(
    minutes: ReminderLeadTimeMinutes
  ) {
    setReminderLeadTimeMinutes(
      minutes
    );

    setReminderLeadTime(
      minutes
    );
  }

  async function handleInvitePartner() {
    if (!user || !email) {
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
          inviterEmail:
            email,
          inviteeEmail:
            inviteEmail,
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
      !email ||
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
        inviterEmail:
          pendingInvite.inviterEmail ??
          '',
        currentUserId:
          user.id,
        currentUserEmail:
          email,
      });

      await refreshPartnerState();

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

  async function handleDisconnectPartner() {
    if (!partner?.connectionId) {
      disconnectPartner();

      clearRuntimeCards();

      return;
    }

    const confirmed =
      window.confirm(
        'Disconnect this partner? Duo will stop sharing responsibilities with this partner. Existing card rows will stay in Supabase, but they will no longer load as an active connection.'
      );

    if (!confirmed) {
      return;
    }

    setDisconnectStatus(
      'disconnecting'
    );

    setDisconnectError('');

    try {
      await disconnectPartnerConnection({
        connectionId:
          partner.connectionId,
      });

      disconnectPartner();

      clearRuntimeCards();

      setDisconnectStatus('idle');
    } catch (error) {
      setDisconnectStatus('error');

      setDisconnectError(
        error instanceof Error
          ? error.message
          : 'Could not disconnect partner.'
      );
    }
  }

  async function handleSignOut() {
    await signOut();

    onClose();
  }

  return (
    <div
      style={panelScreenStyle}
    >
      <div
        style={panelInnerStyle}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            marginBottom: 22,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: -0.7,
                color: duoColors.text,
                lineHeight: 1.05,
              }}
            >
              Settings
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                color: duoColors.muted,
                fontWeight: 500,
              }}
            >
              Manage Duo on this device.
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close settings"
            style={closeButtonStyle()}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection:
              'column',
            gap: 14,
            paddingBottom: 24,
          }}
        >
          <section
            style={{
              ...cardSurfaceStyle,
              padding: 17,
            }}
          >
            <SectionTitle label="Partner connection" />

            {isNotConnected && (
              <>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 650,
                    marginBottom: 7,
                    color: duoColors.text,
                  }}
                >
                  Not connected yet
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: duoColors.muted,
                    lineHeight: 1.45,
                    marginBottom: 16,
                    fontWeight: 500,
                  }}
                >
                  Invite one partner to share responsibilities.
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
                    ...inputStyle,
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
                    ...primaryButtonStyle,
                    width: '100%',
                    height: 52,
                    opacity:
                      inviteStatus ===
                      'sending'
                        ? 0.58
                        : 1,
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
                    fontSize: 17,
                    fontWeight: 650,
                    marginBottom: 7,
                    color: duoColors.text,
                  }}
                >
                  {isIncomingInvite
                    ? 'Invite received'
                    : 'Invite pending'}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: duoColors.muted,
                    lineHeight: 1.45,
                    marginBottom: 16,
                    fontWeight: 500,
                  }}
                >
                  {isIncomingInvite
                    ? 'A partner invited you to connect on Duo.'
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
                        ...primaryButtonStyle,
                        flex: 1,
                        height: 50,
                        opacity:
                          inviteStatus ===
                          'accepting'
                            ? 0.58
                            : 1,
                      }}
                    >
                      {inviteStatus ===
                      'accepting'
                        ? 'Accepting'
                        : 'Accept'}
                    </button>
                  )}

                  {isOutgoingInvite && (
                    <div
                      style={{
                        height: 50,
                        flex: 1,
                        display:
                          'inline-flex',
                        alignItems:
                          'center',
                        color:
                          duoColors.muted,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Waiting
                    </div>
                  )}

                  <button
                    onClick={
                      handleCancelInvite
                    }
                    style={{
                      ...secondaryButtonStyle,
                      flex: 1,
                      height: 50,
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
                    fontSize: 17,
                    fontWeight: 650,
                    marginBottom: 5,
                    color: duoColors.text,
                  }}
                >
                  Connected to Partner
                </div>

                {partner?.email ? (
                  <div
                    style={{
                      fontSize: 13,
                      color:
                        duoColors.muted,
                      lineHeight: 1.4,
                      fontWeight: 500,
                      overflow:
                        'hidden',
                      textOverflow:
                        'ellipsis',
                      whiteSpace:
                        'nowrap',
                    }}
                  >
                    {partner.email}
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: 13,
                      color:
                        duoColors.muted,
                      lineHeight: 1.4,
                      fontWeight: 500,
                    }}
                  >
                    Partner account will appear after the next sync.
                  </div>
                )}

                <button
                  onClick={
                    handleDisconnectPartner
                  }
                  disabled={
                    disconnectStatus ===
                    'disconnecting'
                  }
                  style={{
                    ...secondaryButtonStyle,
                    width: '100%',
                    marginTop: 16,
                    opacity:
                      disconnectStatus ===
                      'disconnecting'
                        ? 0.58
                        : 1,
                  }}
                >
                  {disconnectStatus ===
                  'disconnecting'
                    ? 'Disconnecting'
                    : 'Disconnect partner'}
                </button>

                {disconnectStatus ===
                  'error' && (
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 13,
                      color: duoColors.red,
                      lineHeight: 1.45,
                    }}
                  >
                    {disconnectError}
                  </div>
                )}
              </>
            )}

            {inviteStatus ===
              'error' && (
              <div
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  color: duoColors.red,
                  lineHeight: 1.45,
                }}
              >
                {inviteError}
              </div>
            )}
          </section>

          <section
            style={{
              ...cardSurfaceStyle,
              padding: 17,
            }}
          >
            <SectionTitle label="Notifications" />

            <div
              style={{
                fontSize: 17,
                fontWeight: 650,
                marginBottom: 7,
                color: duoColors.text,
              }}
            >
              Quiet by default
            </div>

            <div
              style={{
                fontSize: 13,
                color: duoColors.muted,
                lineHeight: 1.45,
                marginBottom: 16,
                fontWeight: 500,
              }}
            >
              Duo can send real device notifications when your browser supports them.
            </div>

            {notificationStatus ===
              'unsupported' && (
              <div
                style={{
                  fontSize: 13,
                  color: duoColors.muted,
                  lineHeight: 1.45,
                }}
              >
                Real push notifications are not supported in this browser.
              </div>
            )}

            {notificationStatus ===
              'missing-public-key' && (
              <div
                style={{
                  fontSize: 13,
                  color: duoColors.red,
                  lineHeight: 1.45,
                }}
              >
                {notificationError ||
                  'Missing VAPID public key.'}
              </div>
            )}

            {notificationStatus ===
              'blocked' && (
              <div
                style={{
                  fontSize: 13,
                  color: duoColors.red,
                  lineHeight: 1.45,
                }}
              >
                Notifications are blocked for Duo. Enable them in your browser settings.
              </div>
            )}

            {notificationStatus ===
              'error' && (
              <div
                style={{
                  fontSize: 13,
                  color: duoColors.red,
                  lineHeight: 1.45,
                  marginBottom: 12,
                }}
              >
                {notificationError}
              </div>
            )}

            {notificationStatus ===
              'enabled' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    minHeight: 42,
                    padding: '0 16px',
                    borderRadius: 999,
                    background:
                      'rgba(22,163,106,0.12)',
                    color: duoColors.green,
                    fontSize: 13,
                    fontWeight: 650,
                    lineHeight: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Real notifications are enabled
                </div>

                <button
                  onClick={
                    handleDisableNotifications
                  }
                  style={{
                    ...secondaryButtonStyle,
                    width: 'auto',
                    minHeight: 42,
                    padding: '0 16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  Disable notifications
                </button>
              </div>
            )}

            {(notificationStatus ===
              'idle' ||
              notificationStatus ===
                'disabled' ||
              notificationStatus ===
                'requesting') && (
              <button
                onClick={
                  handleEnableNotifications
                }
                disabled={
                  notificationStatus ===
                  'requesting'
                }
                style={{
                  ...secondaryButtonStyle,
                  width: 'auto',
                  padding:
                    '0 15px',
                  height: 42,
                  color:
                    duoColors.text,
                  opacity:
                    notificationStatus ===
                    'requesting'
                      ? 0.58
                      : 1,
                }}
              >
                {notificationStatus ===
                'requesting'
                  ? 'Enabling'
                  : 'Enable notifications'}
              </button>
            )}

            <div
              style={{
                marginTop: 22,
                paddingTop: 16,
                borderTop:
                  '1px solid rgba(24,32,44,0.06)',
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 650,
                  marginBottom: 6,
                  color: duoColors.text,
                }}
              >
                Reminder time
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: duoColors.muted,
                  lineHeight: 1.45,
                  marginBottom: 12,
                  fontWeight: 500,
                }}
              >
                Choose when Duo reminds you.
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                {REMINDER_LEAD_TIME_OPTIONS.map(
                  (minutes) => {
                    const selected =
                      reminderLeadTime ===
                      minutes;

                    return (
                      <button
                        key={minutes}
                        onClick={() =>
                          handleReminderLeadTimeChange(
                            minutes
                          )
                        }
                        style={{
                          minHeight: 38,
                          padding:
                            '0 12px',
                          borderRadius: 999,
                          border: selected
                            ? '1px solid rgba(24,32,44,0.16)'
                            : '1px solid rgba(24,32,44,0.08)',
                          background: selected
                            ? 'rgba(24,32,44,0.075)'
                            : 'rgba(255,255,255,0.82)',
                          color: selected
                            ? duoColors.text
                            : duoColors.muted,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          boxShadow: 'none',
                        }}
                      >
                        {formatReminderLeadTime(
                          minutes
                        )}
                      </button>
                    );
                  }
                )}
              </div>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color:
                    duoColors.softMuted,
                  lineHeight: 1.4,
                  fontWeight: 500,
                }}
              >
                Due-soon background reminders will be connected after push sending works.
              </div>
            </div>
          </section>

          <section
            style={{
              ...cardSurfaceStyle,
              padding: 17,
            }}
          >
            <SectionTitle label="Account" />

            <div
              style={{
                fontSize: 17,
                fontWeight: 650,
                marginBottom: 7,
                color: duoColors.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {email || 'Signed in'}
            </div>

            <div
              style={{
                fontSize: 13,
                color: duoColors.muted,
                lineHeight: 1.45,
                marginBottom: 16,
                fontWeight: 500,
              }}
            >
              Duo uses this account to connect responsibilities to the right person.
            </div>

            <button
              onClick={
                handleSignOut
              }
              style={{
                ...secondaryButtonStyle,
                width: '100%',
              }}
            >
              Sign out
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}