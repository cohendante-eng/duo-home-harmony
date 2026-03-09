import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCards } from '@/store/useCards';
import { DuoCard, CardState } from '@/types/card';
import ResponsibilityCard from '@/components/duo/ResponsibilityCard';
import ExpandedCard from '@/components/duo/ExpandedCard';
import CreateFlow from '@/components/duo/CreateFlow';

type View = 'list' | 'expanded' | 'create';

const Index = () => {
  const { cards, addCard, updateState } = useCards();
  const [view, setView] = useState<View>('list');
  const [activeCard, setActiveCard] = useState<DuoCard | null>(null);

  const handleTap = (card: DuoCard) => {
    setActiveCard(card);
    setView('expanded');
  };

  const handleAction = (id: string, state: CardState) => {
    updateState(id, state);
    setView('list');
    setActiveCard(null);
  };

  const handleCreate = (card: DuoCard) => {
    addCard(card);
    setView('list');
  };

  if (view === 'expanded' && activeCard) {
    // find latest version
    const latest = cards.find((c) => c.id === activeCard.id) || activeCard;
    return (
      <ExpandedCard
        card={latest}
        onBack={() => { setView('list'); setActiveCard(null); }}
        onAction={handleAction}
      />
    );
  }

  if (view === 'create') {
    return <CreateFlow onClose={() => setView('list')} onCreate={handleCreate} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-md mx-auto">
      {/* Header */}
      <div className="px-6 pt-safe-top">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Duo</h1>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-signal-accepted" />
            <span className="text-xs text-muted-foreground">Synced</span>
          </div>
        </div>
      </div>

      {/* Card List */}
      <div className="flex-1 px-4 pb-24">
        <div className="space-y-2">
          {cards.map((card) => (
            <ResponsibilityCard key={card.id} card={card} onTap={handleTap} />
          ))}
        </div>

        {cards.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-32">
            <p className="text-sm text-muted-foreground">No active cards</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setView('create')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
      >
        <Plus size={22} />
      </button>
    </div>
  );
};

export default Index;
