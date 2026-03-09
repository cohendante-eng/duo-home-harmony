import { DuoCard, CARD_TYPE_META, CardState } from '@/types/card';
import { Car, ShoppingBag, CreditCard, Calendar, Wrench, ArrowLeftRight } from 'lucide-react';

const iconMap: Record<string, React.FC<{ className?: string; size?: number }>> = {
  Car, ShoppingBag, CreditCard, Calendar, Wrench, ArrowLeftRight,
};

const stateStyles: Record<CardState, string> = {
  requested: 'bg-signal-requested/12 text-signal-requested',
  accepted: 'bg-signal-accepted/12 text-signal-accepted',
  done: 'bg-muted text-muted-foreground',
  blocked: 'bg-signal-blocked/12 text-signal-blocked',
  delayed: 'bg-signal-delayed/12 text-signal-delayed',
  skipped: 'bg-muted text-muted-foreground',
};

const stateLabel: Record<CardState, string> = {
  requested: 'Requested',
  accepted: 'Accepted',
  done: 'Done',
  blocked: 'Blocked',
  delayed: 'Delayed',
  skipped: 'Skipped',
};

interface Props {
  card: DuoCard;
  onTap: (card: DuoCard) => void;
}

export default function ResponsibilityCard({ card, onTap }: Props) {
  const meta = CARD_TYPE_META[card.type];
  const Icon = iconMap[meta.icon];

  return (
    <button
      onClick={() => onTap(card)}
      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/60 hover:border-border transition-all duration-200 active:scale-[0.98] text-left"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
        <Icon size={18} className="text-secondary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{card.subject}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{card.context}</p>
      </div>
      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        <span className="text-[11px] text-muted-foreground">{card.time}</span>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${stateStyles[card.state]}`}>
          {stateLabel[card.state]}
        </span>
      </div>
    </button>
  );
}
