type Props = {
    title: string;
  
    description: string;
  };
  
  export default function EmptyState({
    title,
    description,
  }: Props) {
    return (
      <div
        style={{
          paddingTop: 72,
  
          display: 'flex',
  
          flexDirection: 'column',
  
          alignItems: 'center',
  
          textAlign: 'center',
  
          color: '#999',
        }}
      >
        <div
          style={{
            fontSize: 15,
  
            fontWeight: 650,
  
            color: '#777',
  
            marginBottom: 8,
          }}
        >
          {title}
        </div>
  
        <div
          style={{
            maxWidth: 260,
  
            fontSize: 13,
  
            lineHeight: 1.45,
  
            color: '#aaa',
          }}
        >
          {description}
        </div>
      </div>
    );
  }