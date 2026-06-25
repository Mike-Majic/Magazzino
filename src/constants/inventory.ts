import type { InventoryStatus } from '../data';

export const inventoryStatuses: InventoryStatus[] = ['da_assegnare', 'assegnato', 'installato', 'da_riconsegnare', 'riconsegnato', 'denunciato'];

export const inventoryStatusLabels: Record<InventoryStatus, string> = {
  da_assegnare: 'Da assegnare',
  assegnato: 'Assegnato',
  installato: 'Installato',
  da_riconsegnare: 'Da riconsegnare',
  riconsegnato: 'Riconsegnato',
  denunciato: 'Denunciato'
};

export const inventoryStatusRoutes: Record<InventoryStatus, string> = {
  da_assegnare: '/inventory?status=da_assegnare',
  assegnato: '/inventory?status=assegnato',
  installato: '/installed',
  da_riconsegnare: '/to-return',
  riconsegnato: '/to-return?status=riconsegnato',
  denunciato: '/reported'
};
