export type InventoryRow = {
  serial: string;
  model: string;
  sap: string;
  status: 'giacente' | 'assegnato' | 'installato' | 'da_riconsegnare' | 'riconsegnato' | 'guasto' | 'scaricato';
  assignedTo: string;
  notes: string;
};

export type MovementRow = {
  date: string;
  user: string;
  serial: string;
  from: string;
  to: string;
  technician: string;
  notes: string;
};

export const inventoryRows: InventoryRow[] = [
  { serial: 'F2401DH90004065', model: 'NEXXT GPON', sap: '100456', status: 'giacente', assignedTo: '-', notes: 'Disponibile' },
  { serial: 'CP2518JETCA', model: 'NEXXT SEVEN GPON', sap: '100693', status: 'assegnato', assignedTo: 'NICO', notes: 'Consegna urgente' },
  { serial: 'R19100000092737', model: 'VDF Wifi 5', sap: 'VDF5', status: 'installato', assignedTo: 'FINOCCHI', notes: 'Account 96417557' },
  { serial: 'ZTEEGAFPBH00868', model: 'NEXXT ONE LITE IAD', sap: '100599', status: 'da_riconsegnare', assignedTo: 'DENIS', notes: 'Rientro pianificato' }
];

export const movementRows: MovementRow[] = [
  {
    date: '21/05/2026',
    user: 'admin',
    serial: 'F2401DH90004065',
    from: 'giacente',
    to: 'assegnato',
    technician: 'NICO',
    notes: 'Assegnato per installazione'
  },
  {
    date: '21/05/2026',
    user: 'magazzino',
    serial: 'CP2518JETCA',
    from: 'assegnato',
    to: 'installato',
    technician: 'FINOCCHI',
    notes: 'Installazione completata'
  }
];
