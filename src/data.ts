export type Role = 'Admin' | 'Magazzino' | 'Tecnico' | 'Sola lettura';
export type JobRole = 'Tecnico' | 'Assistente' | 'Magazziniere' | 'Admin';

export type UserRow = {
  id: number;
  firstName: string;
  lastName: string;
  role: Role;
  jobRole?: JobRole;
  locked?: boolean;
};

export type SapItem = { id: number; sapCode: string; modelName: string; provider: string };

export type InventoryStatus = 'da_assegnare' | 'assegnato' | 'installato' | 'da_riconsegnare' | 'denunciato';

export type InventoryRow = {
  id: number;
  serial: string;
  model: string;
  sap: string;
  status: InventoryStatus;
  assignedTo: string;
  notes: string;
  createdAt: string;
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
  { id: 1, firstName: 'Michael', lastName: 'Colurci', role: 'Admin', jobRole: 'Admin', locked: true },
  { id: 2, firstName: 'Simone', lastName: "D'Alessandro", role: 'Tecnico', jobRole: 'Tecnico' }
];

export const defaultSapCatalog: SapItem[] = [
  { id: 1, sapCode: '100279', modelName: 'TECHNICOLOR', provider: 'FW' },
  { id: 2, sapCode: '100287', modelName: 'TECHNICOLOR', provider: 'FW' },
  { id: 3, sapCode: '100315', modelName: 'FASTGATE', provider: 'FW' },
  { id: 4, sapCode: '100365', modelName: 'FASTGATE', provider: 'FW' },
  { id: 5, sapCode: '100368', modelName: 'FASTGATE', provider: 'FW' }
];

export const initialInventoryRows: InventoryRow[] = [
  { id: 1, serial: 'F2401DH90004065', model: 'NEXXT GPON', sap: '100456', status: 'da_assegnare', assignedTo: '-', notes: 'Disponibile', createdAt: '2026-05-20' },
  { id: 2, serial: 'CP2518JETCA', model: 'NEXXT SEVEN GPON', sap: '100693', status: 'assegnato', assignedTo: 'Michael Colurci', notes: 'Consegna urgente', createdAt: '2026-05-20' },
  { id: 3, serial: 'R19100000092737', model: 'VDF Wifi 5', sap: 'VDF5', status: 'installato', assignedTo: 'Simone D\'Alessandro', notes: 'Account 96417557', createdAt: '2026-05-21' },
  { id: 4, serial: 'ZX001', model: 'WIND', sap: 'WIND', status: 'da_riconsegnare', assignedTo: 'Simone D\'Alessandro', notes: 'Rientro atteso', createdAt: '2026-05-22' }
];
