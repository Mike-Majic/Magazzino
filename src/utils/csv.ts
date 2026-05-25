export function toCsvValue(value: unknown): string {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export function buildCsv(headers: string[], rows: Array<Array<unknown>>): string {
  const head = headers.map(toCsvValue).join(';');
  const body = rows.map((row) => row.map(toCsvValue).join(';')).join('\n');
  return `\uFEFF${head}\n${body}`;
}

export function downloadCsv(csv: string, fileName: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  a.download = fileName;
  a.click();
}
