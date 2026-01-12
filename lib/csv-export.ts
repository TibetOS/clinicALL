/**
 * CSV Export Utility
 *
 * SECURITY: Includes protection against CSV formula injection attacks.
 * Characters =, +, -, @, tab, carriage return can execute formulas in Excel.
 */

/**
 * Sanitize a CSV value to prevent formula injection attacks.
 * Excel/Google Sheets treat cells starting with =, +, -, @, tab, CR as formulas.
 *
 * @param value - The value to sanitize
 * @returns Sanitized string safe for CSV export
 */
export function sanitizeCSVValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';

  const stringValue = String(value);

  // If value starts with dangerous characters, prefix with single quote
  // This prevents formula execution in spreadsheet applications
  if (/^[=+\-@\t\r]/.test(stringValue)) {
    return `'${stringValue}`;
  }

  // Escape double quotes by doubling them (CSV standard)
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

type CSVExportOptions = {
  /** Filename without extension (date will be appended) */
  filename: string;
  /** Whether to add BOM for Hebrew/Unicode support in Excel */
  addBOM?: boolean;
  /** Custom date format suffix (defaults to ISO date) */
  dateSuffix?: string;
};

/**
 * Export data to CSV file and trigger download.
 *
 * @param headers - Array of column headers
 * @param rows - Array of row data (each row is array of cell values)
 * @param options - Export options
 *
 * @example
 * ```ts
 * exportToCSV(
 *   ['שם', 'טלפון', 'אימייל'],
 *   patients.map(p => [p.name, p.phone, p.email]),
 *   { filename: 'patients' }
 * );
 * ```
 */
export function exportToCSV(
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][],
  options: CSVExportOptions
): void {
  const { filename, addBOM = true, dateSuffix } = options;

  // Sanitize all values
  const sanitizedHeaders = headers.map(h => sanitizeCSVValue(h));
  const sanitizedRows = rows.map(row => row.map(cell => sanitizeCSVValue(cell)));

  // Build CSV content
  const csvContent = [sanitizedHeaders, ...sanitizedRows]
    .map(row => row.join(','))
    .join('\n');

  // Add BOM for Hebrew/Unicode support in Excel
  const BOM = addBOM ? '\uFEFF' : '';
  const content = BOM + csvContent;

  // Create blob and trigger download
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${dateSuffix || new Date().toISOString().split('T')[0]}.csv`;
  link.click();

  // Cleanup
  URL.revokeObjectURL(url);
}

/**
 * Create a reusable CSV exporter for a specific data type.
 *
 * @example
 * ```ts
 * const exportPatients = createCSVExporter<Patient>(
 *   ['שם', 'טלפון', 'אימייל'],
 *   (p) => [p.name, p.phone, p.email]
 * );
 *
 * // Later:
 * exportPatients(patients, 'patients');
 * ```
 */
export function createCSVExporter<T>(
  headers: string[],
  rowMapper: (item: T) => (string | number | boolean | null | undefined)[]
): (data: T[], filename: string) => void {
  return (data: T[], filename: string) => {
    const rows = data.map(rowMapper);
    exportToCSV(headers, rows, { filename });
  };
}
