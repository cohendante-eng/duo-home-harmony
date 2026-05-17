type Props = {
    onClick: () => void;
  };
  
  export default function FloatingCreateButton({
    onClick,
  }: Props) {
    return (
      <button
        onClick={onClick}
        style={{
          position: 'fixed',
  
          right: 18,
  
          bottom: 92,
  
          width: 56,
  
          height: 56,
  
          borderRadius: 999,
  
          border: 'none',
  
          background: '#111',
  
          color: '#fff',
  
          fontSize: 30,
  
          boxShadow:
            '0 10px 30px rgba(0,0,0,0.18)',
  
          cursor: 'pointer',
  
          zIndex: 60,
        }}
      >
        +
      </button>
    );
  }