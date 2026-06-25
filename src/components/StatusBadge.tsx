import type { InventoryStatus } from '../data';
import { inventoryStatusLabels } from '../constants/inventory';

type Props = { status: InventoryStatus };

export function StatusBadge({ status }: Props) {
  return <span className={`status-badge status-${status}`}>{inventoryStatusLabels[status]}</span>;
}
