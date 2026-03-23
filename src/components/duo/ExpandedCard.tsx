import { DuoCard, CardType, CardState } from '../../types/card';
import { Car, ShoppingBag, CreditCard, Calendar, Wrench, ArrowLeftRight, ChevronLeft, MoreHorizontal, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const iconMap: Record<CardType, LucideIcon> = {
  transport: Car,
  acquire: ShoppingBag,
  pay: CreditCard,
  appointment: Calendar,
  maintenance: Wrench,
  coordination: ArrowLeftRight,
};

const stateStyles: Record<CardState, string> = {
  requested: 'bg-signal-requested/12 text-signal-requested',
  accepted: 'bg-signal-accepted/12 text-signal-accepted',
  done: 'bg-muted text-muted-foreground',
  blocked: 'bg-signal-blocked/12 text-signal-blocked',
  delayed: 'bg-signal-delayed/12 text-signal-delayed',
  skipped: 'bg-muted text-muted-foreground',
};

interface Props {
  card: DuoCard;
  onBack: () => void;
  onAction: (id: string, state: CardState) => void;
}

export default function ExpandedCard({ card, onBack, onAction }: Props) {
  const Icon = iconMap[card.type];
  const payload = card.payload ?? {};
  const titleMap: Record<CardType, () => string> = {
    transport: () => payload.item || 'Transport',
    acquire: () => payload.item || 'Acquire item',
    pay: () => `${payload.what || 'Payment'} bill`,
    appointment: () => payload.with || 'Appointment',
    maintenance: () => payload.what || 'Maintenance',
    coordination: () => payload.topic || 'Coordination',
  };
  
  const contextMap: Record<CardType, () => string> = {
    transport: () => [payload.from, payload.to].filter(Boolean).join(' → '),
    acquire: () => [payload.source, payload.quantity].filter(Boolean).join(' · '),
    pay: () => [payload.amount, payload.to].filter(Boolean).join(' · '),
    appointment: () => [payload.location, payload.with].filter(Boolean).join(' · '),
    maintenance: () => [payload.location, payload.detail].filter(Boolean).join(' · '),
    coordination: () => [payload.person, payload.detail].filter(Boolean).join(' · '),
  };
  
  const title = titleMap[card.type]();
  const context = contextMap[card.type]();
  const timeText = card.dueAt ? new Date(card.dueAt).toLocaleString() : '';
  const primaryAction = card.state === 'requested'
    ? { label: 'Accept', next: 'accepted' as CardState }
    : card.state === 'accepted'
    ? { label: 'Done', next: 'done' as CardState }
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe-top h-14">
        <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
          <ChevronLeft size={20} className="text-foreground" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 -mr-2 rounded-xl hover:bg-secondary transition-colors">
              <MoreHorizontal size={20} className="text-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            <DropdownMenuItem onClick={() => onAction(card.id, 'delayed')}>Delay</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction(card.id, 'blocked')}>Block</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction(card.id, 'skipped')}>Skip</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

{/* Content */}
<div className="flex-1 px-6 pt-6">
  <div className="flex items-center gap-3 mb-6">
    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
      <Icon size={22} className="text-secondary-foreground" />
    </div>

    <div>
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        {card.type}
      </p>
      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${stateStyles[card.state]}`}>
        {card.state.charAt(0).toUpperCase() + card.state.slice(1)}
      </span>
    </div>
  </div>

  <h1 className="text-2xl font-semibold text-foreground mb-2">{title}</h1>
  <p className="text-base text-muted-foreground mb-6">{context}</p>

  <div className="space-y-4">
    <div className="flex justify-between py-3 border-b border-border/60">
      <span className="text-sm text-muted-foreground">Time</span>
      <span className="text-sm font-medium text-foreground">{timeText}</span>
    </div>

    {Object.entries(payload).map(([key, value]) => (
      <div key={key} className="flex justify-between py-3 border-b border-border/60">
        <span className="text-sm text-muted-foreground capitalize">{key}</span>
        <span className="text-sm font-medium text-foreground">{String(value)}</span>
      </div>
    ))}
  </div>
</div>

      {/* Primary Action */}
      {primaryAction && (
        <div className="px-6 pb-8 pt-4">
          <Button
            onClick={() => onAction(card.id, primaryAction.next)}
            className="w-full h-12 rounded-2xl text-base font-medium"
          >
            {primaryAction.label}
          </Button>
        </div>
      )}
    </div>
  );
}
