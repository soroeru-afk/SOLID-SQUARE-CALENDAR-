import { LogFile } from '@/lib/fs';

export function formatDateStr(dateStr: string) {
  // 20260521 -> 2026.05.21
  return `${dateStr.slice(0,4)}.${dateStr.slice(4,6)}.${dateStr.slice(6,8)}`;
}

export function formatTimeStr(timeStr: string) {
  // 0107 -> 01:07
  return `${timeStr.slice(0,2)}:${timeStr.slice(2,4)}`;
}

export function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday

  const days: Date[] = [];
  const d = new Date(startDate);
  while (d <= endDate) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export function toYYYYMMDD(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

export function getMonthDays(year: number, month: number) {
  const days: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}
