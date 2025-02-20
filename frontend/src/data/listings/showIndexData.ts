export default function ShowIndexData(
  data: Array<{date: Date, value: number}>,
  dates: Array<string>,
  location: string
) {
  if (!data || data.length === 0) {
    return {
      labels: [],
      datasets: [{
        label: `${location} Index`,
        data: [],
        borderColor: "#20FC8F",
        tension: 0.1, 
        pointRadius: 0,
      }],
    };
  }

  return {
    labels: dates,
    datasets: [
      {
        label: `${location} Index`,
        data: data,  // Keep the full data object with date and value
        borderColor: "#20FC8F",
        tension: 0.1,
        pointRadius: 0,
      },
    ],
  };
}
