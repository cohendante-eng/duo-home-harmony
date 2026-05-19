import {
    useState,
  } from 'react';
  
  import {
    useAuth,
  } from '../../hooks/useAuth';
  
  export default function AuthScreen() {
    const {
      signInWithEmail,
    } = useAuth();
  
    const [email, setEmail] =
      useState('');
  
    const [status, setStatus] =
      useState<
        'idle' | 'sending' | 'sent' | 'error'
      >('idle');
  
    const [errorMessage, setErrorMessage] =
      useState('');
  
    async function handleSubmit(
      event: React.FormEvent
    ) {
      event.preventDefault();
  
      if (!email) {
        return;
      }
  
      setStatus('sending');
  
      setErrorMessage('');
  
      try {
        await signInWithEmail(email);
  
        setStatus('sent');
      } catch (error) {
        setStatus('error');
  
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Something went wrong.'
        );
      }
    }
  
    return (
      <div
        style={{
          minHeight: '100vh',
  
          display: 'flex',
  
          alignItems: 'center',
  
          justifyContent: 'center',
  
          padding: 24,
  
          background: '#fff',
        }}
      >
        <div
          style={{
            width: '100%',
  
            maxWidth: 420,
          }}
        >
          <div
            style={{
              fontSize: 34,
  
              fontWeight: 800,
  
              letterSpacing: -0.8,
  
              marginBottom: 10,
  
              color: '#111',
            }}
          >
            Duo
          </div>
  
          <div
            style={{
              fontSize: 15,
  
              lineHeight: 1.45,
  
              color: '#777',
  
              marginBottom: 34,
            }}
          >
            Sign in to connect household responsibilities with one trusted partner.
          </div>
  
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
  
              flexDirection: 'column',
  
              gap: 14,
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="Email"
              style={{
                height: 56,
  
                borderRadius: 18,
  
                border:
                  '1px solid rgba(0,0,0,0.08)',
  
                padding:
                  '0 16px',
  
                fontSize: 16,
  
                outline: 'none',
              }}
            />
  
            <button
              type="submit"
              disabled={
                !email ||
                status === 'sending'
              }
              style={{
                height: 58,
  
                borderRadius: 18,
  
                border: 'none',
  
                background:
                  email &&
                  status !== 'sending'
                    ? '#111'
                    : 'rgba(0,0,0,0.12)',
  
                color: '#fff',
  
                fontSize: 16,
  
                fontWeight: 750,
  
                cursor:
                  email &&
                  status !== 'sending'
                    ? 'pointer'
                    : 'default',
              }}
            >
              {status === 'sending'
                ? 'Sending link'
                : 'Send login link'}
            </button>
          </form>
  
          {status === 'sent' && (
            <div
              style={{
                marginTop: 18,
  
                padding: 14,
  
                borderRadius: 16,
  
                background:
                  'rgba(34,197,94,0.08)',
  
                color: '#15803d',
  
                fontSize: 14,
  
                lineHeight: 1.45,
  
                fontWeight: 600,
              }}
            >
              Check your email. Open the login link to continue.
            </div>
          )}
  
          {status === 'error' && (
            <div
              style={{
                marginTop: 18,
  
                padding: 14,
  
                borderRadius: 16,
  
                background:
                  'rgba(220,38,38,0.08)',
  
                color: '#991b1b',
  
                fontSize: 14,
  
                lineHeight: 1.45,
  
                fontWeight: 600,
              }}
            >
              {errorMessage}
            </div>
          )}
  
          <div
            style={{
              marginTop: 28,
  
              fontSize: 12,
  
              lineHeight: 1.45,
  
              color: '#aaa',
            }}
          >
            Duo is private by design. No chat, no comments, no monitoring.
          </div>
        </div>
      </div>
    );
  }