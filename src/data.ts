export type Role = 'Admin' | 'Magazzino' | 'Tecnico' | 'Sola lettura';

export type UserRow = {
  id: number;
  firstName: string;
  lastName: string;
  role: Role;
};

export type SapItem = {
  id: number;
  sapCode: string;
  modelName: string;
  provider: string;
};

export type InventoryStatus =
  | 'giacente'
  | 'assegnato'
  | 'installato'
  | 'da_riconsegnare'
  | 'riconsegnato'
  | 'guasto'
  | 'scaricato';

export type InventoryRow = {
  id: number;
  serial: string;
  model: string;
  sap: string;
  status: InventoryStatus;
  assignedTo: string;
  notes: string;
  attachmentName?: string;
  attachmentUrl?: string;
};

export type MovementRow = {
  id: number;
  date: string;
  time: string;
  user: string;
  serial: string;
  action: string;
  technician: string;
  notes: string;
  attachmentName?: string;
  attachmentUrl?: string;
};

export const seededUsers: UserRow[] = [
  { id: 1, firstName: 'Michael', lastName: 'Colurci', role: 'Tecnico' },
  { id: 2, firstName: 'Simone', lastName: "D'Alessandro", role: 'Tecnico' }
];

export const defaultSapCatalog: SapItem[] = [
  { id: 1, sapCode: '100455', modelName: 'NEXXT IAD', provider: 'FW' },
  { id: 2, sapCode: '100456', modelName: 'NEXXT GPON', provider: 'FW' },
  { id: 3, sapCode: '100599', modelName: 'NEXXT ONE LITE IAD', provider: 'FW' },
  { id: 4, sapCode: 'VDF5', modelName: 'VDF Wifi 5', provider: 'VDF' }
];

export const initialInventoryRows: InventoryRow[] = [
  { id: 1, serial: 'F2401DH90004065', model: 'NEXXT GPON', sap: '100456', status: 'giacente', assignedTo: '-', notes: 'Disponibile' },
  { id: 2, serial: 'CP2518JETCA', model: 'NEXXT SEVEN GPON', sap: '100693', status: 'assegnato', assignedTo: 'Michael Colurci', notes: 'Consegna urgente' },
  { id: 3, serial: 'R19100000092737', model: 'VDF Wifi 5', sap: 'VDF5', status: 'installato', assignedTo: 'Simone D\'Alessandro', notes: 'Account 96417557' }
];
