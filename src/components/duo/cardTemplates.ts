import {
    CarFront,
    CreditCard,
    ShoppingBag,
    Calendar,
    Wrench,
  } from 'lucide-react';
  
  export const CARD_TEMPLATES = [
    {
      type: 'transport',
      label: 'Transport',
      icon: CarFront,
    },
  
    {
      type: 'pay',
      label: 'Pay',
      icon: CreditCard,
    },
  
    {
      type: 'acquire',
      label: 'Acquire',
      icon: ShoppingBag,
    },
  
    {
      type: 'appointment',
      label: 'Appointment',
      icon: Calendar,
    },
  
    {
      type: 'maintenance',
      label: 'Maintenance',
      icon: Wrench,
    },
  ] as const;