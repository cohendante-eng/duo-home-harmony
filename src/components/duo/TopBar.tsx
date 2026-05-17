import {
    CircleUserRound,
  } from 'lucide-react';
  
  import {
    UserId,
  } from '../../types/card';
  
  type Props = {
    currentUser: UserId;
  
    setCurrentUser: (
      user: UserId
    ) => void;
  
    onOpenSettings: () => void;
  };
  
  export default function TopBar({
    currentUser,
    setCurrentUser,
    onOpenSettings,
  }: Props) {
    return (
      <div
        style={{
          display: 'flex',
  
          justifyContent:
            'space-between',
  
          alignItems: 'center',
  
          marginBottom: 24,
        }}
      >
        <button
          onClick={onOpenSettings}
          style={{
            width: 30,
  
            height: 30,
  
            borderRadius: 999,
  
            border:
              '1px solid rgba(0,0,0,0.06)',
  
            background: '#fff',
  
            display: 'flex',
  
            alignItems: 'center',
  
            justifyContent:
              'center',
  
            color: '#777',
  
            cursor: 'pointer',
          }}
        >
          <CircleUserRound
            size={16}
          />
        </button>
  
        <div
          style={{
            display: 'flex',
  
            gap: 10,
  
            opacity: 0.45,
  
            fontSize: 13,
          }}
        >
          <button
            onClick={() =>
              setCurrentUser(
                'me'
              )
            }
            style={{
              border: 'none',
  
              background: 'none',
  
              padding: 0,
  
              fontSize: 13,
  
              fontWeight:
                currentUser === 'me'
                  ? 700
                  : 400,
  
              cursor: 'pointer',
            }}
          >
            Me
          </button>
  
          <button
            onClick={() =>
              setCurrentUser(
                'partner'
              )
            }
            style={{
              border: 'none',
  
              background: 'none',
  
              padding: 0,
  
              fontSize: 13,
  
              fontWeight:
                currentUser ===
                'partner'
                  ? 700
                  : 400,
  
              cursor: 'pointer',
            }}
          >
            Partner
          </button>
        </div>
      </div>
    );
  }