import { useState } from 'react';
import { CardType, DuoCard } from '@/types/card';
import { Car, ShoppingBag, CreditCard, Calendar, Wrench, ArrowLeftRight, ChevronLeft, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const iconMap: Record<string, LucideIcon> = {
  Car, ShoppingBag, CreditCard, Calendar, Wrench, ArrowLeftRight,
};
const typeLabelMap: Record<CardType, string> = {
  transport: 'Transport',
  acquire: 'Acquire',
  pay: 'Pay',
  appointment: 'Appointment',
  maintenance: 'Maintenance',
  coordination: 'Coordination',
};

const typeFieldsMap: Record<CardType, string[]> = {
  transport: ['owner', 'item', 'from', 'to'],
  acquire: ['owner', 'item', 'source', 'quantity'],
  pay: ['owner', 'what', 'amount', 'to'],
  appointment: ['owner', 'with', 'person', 'location'],
  maintenance: ['owner', 'what', 'detail', 'location'],
  coordination: ['owner', 'topic', 'person', 'detail'],
};
interface Props {
  onClose: () => void;
  onCreate: (card: DuoCard) => void;
}

export default function CreateFlow({ onClose, onCreate }: Props) {
  const [selectedType, setSelectedType] = useState<CardType | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleCreate = () => {
    if (!selectedType) return;
    const card: DuoCard = {
      id: crypto.randomUUID(),
      type: selectedType,
      state: 'requested',
      ownerId: formData['owner'] === 'b' ? 'user-b' : 'user-a',
      creatorId: 'user-a',
      dueAt: new Date().toISOString(),
      payload: { ...formData },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onCreate(card);
  };

  // Step 1: Type Selection
  if (!selectedType) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex items-center px-4 h-14">
          <button onClick={onClose} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <h2 className="ml-2 text-base font-medium text-foreground">New Card</h2>
        </div>

        <div className="px-6 pt-4">
          <p className="text-sm text-muted-foreground mb-6">What type of responsibility?</p>
          <div className="grid grid-cols-2 gap-3">
          {(Object.keys(typeLabelMap) as CardType[]).map((type) => {
  const Icon = iconMap[type];

  return (
    <button
      key={type}
      onClick={() => setSelectedType(type)}
      className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border/60 hover:border-border active:scale-[0.97] transition"
    >
      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
        <Icon size={22} className="text-secondary-foreground" />
      </div>
      <span className="text-sm font-medium text-foreground">
        {typeLabelMap[type]}
      </span>
    </button>
  );
})}
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Form
  const fields = typeFieldsMap[selectedType];
  const label = typeLabelMap[selectedType];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex items-center px-4 h-14">
        <button onClick={() => setSelectedType(null)} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
          <ChevronLeft size={20} className="text-foreground" />
        </button>
        <h2 className="ml-2 text-base font-medium text-foreground">{label}</h2>
      </div>

      <div className="flex-1 px-6 pt-4 space-y-4">
        {fields.map((field) => (
          <div key={field}>
            <label className="block text-sm text-muted-foreground capitalize mb-1.5">{field}</label>
            {field === 'owner' ? (
              <div className="flex gap-2">
                {['A', 'B'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setFormData((prev) => ({ ...prev, owner: v }))}
                    className={`flex-1 h-11 rounded-xl border text-sm font-medium transition-colors ${
                      formData.owner === v
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border/60 text-foreground hover:border-border'
                    }`}
                  >
                    Person {v}
                  </button>
                ))}
              </div>
            ) : (
              <Input
                value={formData[field] || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }))}
                placeholder={`Enter ${field}`}
                className="h-11 rounded-xl bg-card border-border/60"
              />
            )}
          </div>
        ))}
      </div>

      <div className="px-6 pb-8 pt-4">
        <Button onClick={handleCreate} className="w-full h-12 rounded-2xl text-base font-medium">
          Create
        </Button>
      </div>
    </div>
  );
}
