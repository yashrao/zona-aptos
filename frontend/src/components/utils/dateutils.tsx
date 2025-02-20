export function formatDate(timestamp: string | undefined) {
  if (timestamp === undefined) {
    return;
  }
  const date = new Date(Number(timestamp) * 1000); // Convert to milliseconds
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
