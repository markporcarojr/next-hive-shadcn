export function formatDateMMDDYYYY(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${month}/${day}/${year}`;
}