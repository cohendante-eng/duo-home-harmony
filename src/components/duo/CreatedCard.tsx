import {
    CarFront,
    CreditCard,
    ShoppingBag,
    Calendar,
    Wrench,
  } from 'lucide-react';
  
  import {
    DuoCard,
  } from '../../types/card';
  
  import {
    getCardTitle,
    getCardContext,
  } from '../../lib/cards';
  
  type Props = {
    card: DuoCard;
  
    onOpen: (card: DuoCard) => void;
  };
  
  function getIcon(card: DuoCard) {
    if (card.type === 'transport') {
      return <CarFront size={22} />;
    }
  
    if (card.type === 'pay') {
      return <CreditCard size={22} />;
    }
  
    if (card.type === 'acquire') {
      return <ShoppingBag size={22} />;
    }
  
    if (card.type === 'appointment') {
      return <Calendar size={22} />;
    }
  
    if (card.type === 'maintenance') {
      return <Wrench size={22} />;
    }
  
    return null;
  }
  
  export default function CreatedCard({
    card,
    onOpen,
  }: Props) {
    return (
      <button
        onClick={() =>
          onOpen(card)
        }
        style={{
          width: '100%',
  
          height: 88,
  
          boxSizing: 'border-box',
  
          padding: 16,
  
          borderRadius: 18,
  
          border:
            '1px solid rgba(0,0,0,0.06)',
  
          background: '#fff',
  
          textAlign: 'left',
  
          cursor: 'pointer',
  
          display: 'flex',
  
          alignItems: 'flex-start',
  
          gap: 13,
        }}
      >
        <div
          style={{
            width: 46,
  
            height: 46,
  
            borderRadius: 15,
  
            background:
              'rgba(0,0,0,0.04)',
  
            display: 'flex',
  
            alignItems: 'center',
  
            justifyContent: 'center',
  
            color: '#666',
  
            flexShrink: 0,
          }}
        >
          {getIcon(card)}
        </div>
  
        <div
          style={{
            minWidth: 0,
  
            flex: 1,
  
            display: 'flex',
  
            flexDirection: 'column',
  
            gap: 5,
  
            paddingTop: 1,
          }}
        >
          <div
            style={{
              fontSize: 16,
  
              fontWeight: 700,
  
              color: '#111',
  
              lineHeight: 1.16,
  
              overflow: 'hidden',
  
              textOverflow: 'ellipsis',
  
              whiteSpace: 'nowrap',
            }}
          >
            {getCardTitle(card)}
          </div>
  
          <div
            style={{
              fontSize: 13,
  
              color: '#888',
  
              lineHeight: 1.25,
  
              fontWeight: 500,
  
              overflow: 'hidden',
  
              textOverflow: 'ellipsis',
  
              whiteSpace: 'nowrap',
            }}
          >
            {getCardContext(card)}
          </div>
        </div>
      </button>
    );
  }