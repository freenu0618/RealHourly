/**
 * Export utility for time log entries
 */

interface TimeEntry {
  id: string;
  date: string;
  minutes: number;
  category: string;
  intent: string;
  taskDescription: string;
  projectName: string;
  clientName: string | null;
}

export function exportToCSV(entries: TimeEntry[], currentMonth: Date): void {
  const csvRows = [
    ["Date", "Project", "Client", "Category", "Duration(min)", "Task", "Status"],
    ...entries.map((e) => [
      e.date,
      e.projectName,
      e.clientName || "",
      e.category,
      e.minutes.toString(),
      e.taskDescription.replace(/"/g, '""'),
      e.intent,
    ]),
  ];

  const csvContent = csvRows
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, getFilename(currentMonth, "csv"));
}

export function exportToJSON(entries: TimeEntry[], currentMonth: Date): void {
  const jsonContent = JSON.stringify(entries, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  downloadBlob(blob, getFilename(currentMonth, "json"));
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getFilename(currentMonth: Date, extension: "csv" | "json"): string {
  const yearMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
  return `time-entries-${yearMonth}.${extension}`;
}
