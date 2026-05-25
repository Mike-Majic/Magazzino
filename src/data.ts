export type Role = 'Admin' | 'Magazzino' | 'Tecnico' | 'Sola lettura';
export type JobRole = 'Tecnico' | 'Assistente' | 'Magazziniere' | 'Admin';

export type UserRow = {
  id: number;
  firstName: string;
  lastName: string;
  role: Role;
  jobRole?: JobRole;
  locked?: boolean;
  email?: string;
  password?: string;
};

export type SapItem = { id: number; sapCode: string; modelName: string; provider: string };
export type CompanyItem = { id: number; name: string };

export type InventoryStatus = 'da_assegnare' | 'assegnato' | 'installato' | 'da_riconsegnare' | 'riconsegnato' | 'denunciato';

export type InventoryRow = {
  id: number;
  serial: string;
  model: string;
  sap: string;
  status: InventoryStatus;
  assignedTo: string;
  provenance: string;
  notes: string;
  createdAt: string;
  attachmentName?: string;
  attachmentUrl?: string;
  attachmentNames?: string[];
  attachmentUrls?: string[];
};

export type MovementRow = {
  id: number;
  date: string;
  time: string;
  user: string;
  serial: string;
  sap: string;
  status: InventoryStatus;
  provenance: string;
  action: string;
  technician: string;
  notes: string;
  attachmentName?: string;
  attachmentUrl?: string;
  attachmentNames?: string[];
  attachmentUrls?: string[];
};

export const seededUsers: UserRow[] = [
  { id: 1, firstName: 'Michael', lastName: 'Colurci', role: 'Admin', jobRole: 'Admin', locked: true, email: 'm.colurci@gmail.com', password: 'admin123' },
  { id: 2, firstName: 'Simone', lastName: "D'Alessandro", role: 'Tecnico', jobRole: 'Tecnico', email: 'simone@fibertech.it', password: 'test1234' }
];

export const seededCompanies: CompanyItem[] = [
  { id: 1, name: 'SIELTE' },
  { id: 2, name: 'SACI GROUP' }
];

export const defaultSapCatalog: SapItem[] = [
  { id: 1, sapCode: '100279', modelName: 'TECHNICOLOR', provider: 'FW' },
  { id: 2, sapCode: '100287', modelName: 'TECHNICOLOR', provider: 'FW' },
  { id: 3, sapCode: '100315', modelName: 'FASTGATE', provider: 'FW' },
  { id: 4, sapCode: '100365', modelName: 'FASTGATE', provider: 'FW' },
  { id: 5, sapCode: '100368', modelName: 'FASTGATE', provider: 'FW' },
  { id: 6, sapCode: '100386', modelName: 'FASTGATE MOS', provider: 'FW' },
  { id: 7, sapCode: '100387', modelName: 'FASTGATE IAD', provider: 'FW' },
  { id: 8, sapCode: '100389', modelName: 'FASTGATE MOS', provider: 'FW' },
  { id: 9, sapCode: '100390', modelName: 'FASTGATE IAD', provider: 'FW' },
  { id: 10, sapCode: '100410', modelName: 'FASTGATE MOS', provider: 'FW' },
  { id: 11, sapCode: '100411', modelName: 'FASTGATE IAD', provider: 'FW' },
  { id: 12, sapCode: '100422', modelName: 'FASTGATE GPON', provider: 'FW' },
  { id: 13, sapCode: '100432', modelName: 'FASTGATE MOS LIGHT', provider: 'FW' },
  { id: 14, sapCode: '100433', modelName: 'FASTGATE IAD LIGHT', provider: 'FW' },
  { id: 15, sapCode: '100436', modelName: 'FASTGATE MOS LIGHT problematici', provider: 'FW' },
  { id: 16, sapCode: '100437', modelName: 'FASTGATE IAD LIGHT', provider: 'FW' },
  { id: 17, sapCode: '100454', modelName: 'NEXXT', provider: 'FW' },
  { id: 18, sapCode: '100455', modelName: 'NEXXT IAD', provider: 'FW' },
  { id: 19, sapCode: '100456', modelName: 'NEXXT GPON', provider: 'FW' },
  { id: 20, sapCode: '100457', modelName: 'BOOSTER', provider: 'FW' },
  { id: 21, sapCode: '100499', modelName: 'NEXXT ONE', provider: 'FW' },
  { id: 22, sapCode: '100540', modelName: 'MF833U1 - Chiavetta', provider: 'FW' },
  { id: 23, sapCode: '100583', modelName: 'NEXXT ONE LITE MOS', provider: 'FW' },
  { id: 24, sapCode: '100584', modelName: 'NEXXT ONE LITE IAD', provider: 'FW' },
  { id: 25, sapCode: '100585', modelName: 'NEXXT ONE GPON', provider: 'FW' },
  { id: 26, sapCode: '100588', modelName: 'NEXXT ONE LITE MOS', provider: 'FW' },
  { id: 27, sapCode: '100589', modelName: 'NEXXT ONE LITE IAD', provider: 'FW' },
  { id: 28, sapCode: '100590', modelName: 'NEXXT ONE GPON', provider: 'FW' },
  { id: 29, sapCode: '100598', modelName: 'NEXXT ONE LITE MOS', provider: 'FW' },
  { id: 30, sapCode: '100599', modelName: 'NEXXT ONE LITE IAD', provider: 'FW' },
  { id: 31, sapCode: '100607', modelName: 'NEXXT ONE GPON', provider: 'FW' },
  { id: 32, sapCode: '100690', modelName: 'NEXXT SEVEN vantiva xdsl', provider: 'FW' },
  { id: 33, sapCode: '100693', modelName: 'NEXXT SEVEN GPON vantiva', provider: 'FW' },
  { id: 34, sapCode: '100696', modelName: 'NEXXT SEVEN iad zte xdsl', provider: 'FW' },
  { id: 35, sapCode: '100697', modelName: 'NEXXT SEVEN GPON zte', provider: 'FW' },
  { id: 36, sapCode: '100713', modelName: 'BOOSTER SEVEN', provider: 'FW' },
  { id: 37, sapCode: '100719', modelName: 'BOOSTER SEVEN', provider: 'FW' },
  { id: 38, sapCode: '600000', modelName: 'TECHNICOLOR DGA4134FIA', provider: 'FW' },
  { id: 39, sapCode: '600013', modelName: 'TECHNICOLOR DGM434BFWB5 WIFI7', provider: 'FW' },
  { id: 40, sapCode: '800050', modelName: 'FRITZ 5530', provider: 'FW' },
  { id: 41, sapCode: '800070', modelName: 'FRITZ 7530', provider: 'FW' },
  { id: 42, sapCode: '800091', modelName: 'FRITZ 7510', provider: 'FW' },
  { id: 43, sapCode: 'VDF BIANCA', modelName: 'VDF STATION REVOLUTION', provider: 'VDF' },
  { id: 44, sapCode: 'VDF5', modelName: 'VDF Wifi 5', provider: 'VDF' },
  { id: 45, sapCode: 'VDF6', modelName: 'VDF Wifi 6', provider: 'VDF' },
  { id: 46, sapCode: 'VDF7', modelName: 'VDF Wifi 7', provider: 'VDF' },
  { id: 47, sapCode: 'VX830V', modelName: 'WIND', provider: 'WIND' },
  { id: 48, sapCode: 'WIND', modelName: 'WIND', provider: 'WIND' },
  { id: 49, sapCode: 'WIND7', modelName: 'WIND Wifi 7 - 0RZT57457001', provider: 'WIND' },
  { id: 50, sapCode: 'ZXHN H389X', modelName: 'WIND', provider: 'WIND' },
  { id: 51, sapCode: 'ZYXEL', modelName: 'WIND', provider: 'WIND' }
];

export const initialInventoryRows: InventoryRow[] = [
  { id: 1, serial: 'F2401DH90004065', model: 'NEXXT GPON', sap: '100456', status: 'da_assegnare', assignedTo: '-', provenance: 'SIELTE', notes: 'Disponibile', createdAt: '2026-05-20' },
  { id: 2, serial: 'CP2518JETCA', model: 'NEXXT SEVEN GPON', sap: '100693', status: 'assegnato', assignedTo: 'Michael Colurci', provenance: 'SACI GROUP', notes: 'Consegna urgente', createdAt: '2026-05-20' },
  { id: 3, serial: 'R19100000092737', model: 'VDF Wifi 5', sap: 'VDF5', status: 'installato', assignedTo: 'Simone D\'Alessandro', provenance: 'SIELTE', notes: 'Account 96417557', createdAt: '2026-05-21' },
  { id: 4, serial: 'ZX001', model: 'WIND', sap: 'WIND', status: 'da_riconsegnare', assignedTo: 'Simone D\'Alessandro', provenance: 'SACI GROUP', notes: 'Rientro atteso', createdAt: '2026-05-22' }
];
