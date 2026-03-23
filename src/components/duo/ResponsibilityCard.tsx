import { DuoCard, CardType, CardState } from '../../types/card';
import { Car, ShoppingBag, CreditCard, Calendar, Wrench, ArrowLeftRight, LucideIcon } from 'lucide-react';

const iconMap: Record<CardType, LucideIcon> = {
  transport: Car,
  acquire: ShoppingBag,
  pay: CreditCard,
  appointment: Calendar,
  maintenance: Wrench,
  coordination: ArrowLeftRight,
};
const typeLabelMap: Record<CardType, string> = {
  transport: 'Transport',
  acquire: 'Acquire',
  pay: 'Pay',
  appointment: 'Appointment',
  maintenance: 'Maintenance',
  coordination: 'Coordination',
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
  const Icon = iconMap[card.type];
  const titleMap: Record<CardType, (card: DuoCard) => string> = {
    transport: (card) => card.payload.item || 'Transport',
    acquire: (card) => card.payload.item || 'Acquire item',
    pay: (card) => `${card.payload.what || 'Payment'} bill`,
    appointment: (card) => card.payload.with || 'Appointment',
    maintenance: (card) => card.payload.what || 'Maintenance',
    coordination: (card) => card.payload.topic || 'Coordination',
  };
  
  const contextMap: Record<CardType, (card: DuoCard) => string> = {
    transport: (card) => [card.payload.from, card.payload.to].filter(Boolean).join(' → '),
    acquire: (card) => [card.payload.source, card.payload.quantity].filter(Boolean).join(' · '),
    pay: (card) => [card.payload.amount, card.payload.to].filter(Boolean).join(' · '),
    appointment: (card) => [card.payload.location, card.payload.with].filter(Boolean).join(' · '),
    maintenance: (card) => [card.payload.location, card.payload.detail].filter(Boolean).join(' · '),
    coordination: (card) => [card.payload.person, card.payload.detail].filter(Boolean).join(' · '),
  };
  
  const title = titleMap[card.type](card);
  const context = contextMap[card.type](card);
  const timeText = card.dueAt ? new Date(card.dueAt).toLocaleString() : '';
  return (
    <button
      onClick={() => onTap(card)}
      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/60 hover:border-border transition-all duration-200 active:scale-[0.98] text-left"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
        <Icon size={18} className="text-secondary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground truncate">{title}</p>
      <p className="text-xs text-muted-foreground truncate mt-0.5">{context}</p>
      </div>
      <div className="flex-shrink-0 flex flex-col items-end gap-1">
      <span className="text-[11px] text-muted-foreground">{timeText}</span>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${stateStyles[card.state]}`}>
          {stateLabel[card.state]}
        </span>
      </div>
    </button>
  );
}
