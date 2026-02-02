function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function startOfISOWeek(date: Date) {
  // ISO week starts Monday
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatRangeNb(start: Date, end: Date) {
  const fmt = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short" });
  return `${fmt.format(start)}–${fmt.format(end)}`;
}

export function isoWeekNumber(date: Date) {
  // https://en.wikipedia.org/wiki/ISO_week_date#Algorithms
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

export function buildWeeksUntil(deadlineISO: string) {
  const deadline = new Date(deadlineISO + "T00:00:00");
  const today = new Date();
  const first = startOfISOWeek(today);
  const weeks: { weekStart: Date; weekNo: number; label: string }[] = [];

  let cursor = new Date(first);
  let guard = 0;
  while (cursor.getTime() <= deadline.getTime() && guard < 200) {
    const end = addDays(cursor, 6);
    const weekNo = isoWeekNumber(cursor);
    const label = `Uke ${weekNo} (${formatRangeNb(cursor, end)})`;
    weeks.push({ weekStart: new Date(cursor), weekNo, label });
    cursor = addDays(cursor, 7);
    guard += 1;
  }
  return weeks;
}
