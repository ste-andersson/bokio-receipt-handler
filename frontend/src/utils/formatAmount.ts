export function formatAmount(value: string): string {
  const cleaned = value.replace(/[^\d,]/g, "");

  const [integer, decimal] = cleaned.split(",");

  const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return decimal !== undefined ? `${formatted},${decimal}` : formatted;
}

export function parseAmount(value: string): number {
  return parseFloat(value.replace(/\s/g, "").replace(",", ".")) || 0;
}

export function formatAmountOnBlur(value: string): string {
  if (!value.trim()) return "";

  const cleaned = value.replace(/[^\d,]/g, "");
  const [integer, decimal] = cleaned.split(",");
  const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const paddedDecimal = (decimal ?? "").padEnd(2, "0").slice(0, 2);
  return `${formatted},${paddedDecimal}`;
}
