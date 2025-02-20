function parseCustomDate(dateStr: string) {
  const [day, month, year] = dateStr.split(" ");
  const monthIndex = new Date(`${month} 1 2021`).getMonth(); // Get month as a number
  return new Date(year as any, monthIndex as number, day as any);
}

function formatDate(date: Date) {
  const options = { day: "numeric", month: "long", year: "numeric" };
  return date.toLocaleDateString("en-US", options as Object);
}

export default function getDatesInRange(startDate: string, endDate: string) {
  let start = parseCustomDate(startDate);
  let end = parseCustomDate(endDate);
  let dates = [];

  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    dates.push(formatDate(new Date(dt)));
  }

  return dates;
}
