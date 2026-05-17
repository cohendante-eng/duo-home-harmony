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
      return <CarFront size={21} />;
    }
  
    if (card.type === 'pay') {
      return <CreditCard size={21} />;
    }
  
    if (card.type === 'acquire') {
      return <ShoppingBag size={21} />;
    }
  
    if (card.type === 'appointment') {
      return <Calendar size={21} />;
    }
  
    if (card.type === 'maintenance') {
      return <Wrench size={21} />;
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
  
          minHeight: 72,
  
          padding: 15,
  
          borderRadius: 18,
  
          border:
            '1px solid rgba(0,0,0,0.055)',
  
          background: '#fff',
  
          textAlign: 'left',
  
          cursor: 'pointer',
  
          display: 'flex',
  
          alignItems: 'center',
  
          gap: 14,
        }}
      >
        <div
          style={{
            width: 44,
  
            height: 44,
  
            borderRadius: 14,
  
            background:
              'rgba(0,0,0,0.035)',
  
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
  
            display: 'flex',
  
            flexDirection: 'column',
  
            gap: 5,
          }}
        >
          <div
            style={{
              fontSize: 15,
  
              fontWeight: 650,
  
              color: '#111',
  
              whiteSpace: 'nowrap',
  
              overflow: 'hidden',
  
              textOverflow: 'ellipsis',
            }}
          >
            {getCardTitle(card)}
          </div>
  
          <div
            style={{
              fontSize: 13,
  
              color: '#888',
  
              whiteSpace: 'nowrap',
  
              overflow: 'hidden',
  
              textOverflow: 'ellipsis',
            }}
          >
            {getCardContext(card)}
          </div>
        </div>
      </button>
    );
  }