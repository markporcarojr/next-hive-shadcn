export function formatDateMMDDYYYY(dateStr: string) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return ""; // Invalid date
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}
