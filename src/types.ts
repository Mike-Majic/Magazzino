export type ModemStatus =
  | 'giacente'
  | 'assegnato'
  | 'installato'
  | 'da_riconsegnare'
  | 'riconsegnato'
  | 'guasto'
  | 'scaricato';

export interface DashboardCard {
  title: string;
  value: number;
  subtitle: string;
}
