export const CsvUtil = {
  cell(value: unknown): string {
    let s = value === null || value === undefined ? '' : String(value);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  },
  build(headers: string[], rows: unknown[][]): string {
    return [headers, ...rows].map((r) => r.map((c) => CsvUtil.cell(c)).join(',')).join('\r\n');
  },
};
