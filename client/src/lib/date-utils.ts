import { format, isToday, isPast, isYesterday, isTomorrow, startOfDay, parseISO } from 'date-fns';

export function formatDueDate(date: string | Date | null): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) return 'Today';
  if (isYesterday(dateObj)) return 'Yesterday';
  if (isTomorrow(dateObj)) return 'Tomorrow';
  
  return format(dateObj, 'MMM d');
}

export function formatDueDateTime(date: string | Date | null, time?: string): string {
  if (!date) return '';
  
  const dateStr = formatDueDate(date);
  if (time) {
    return `${dateStr} at ${time}`;
  }
  return dateStr;
}

export function isOverdue(date: string | Date | null, completed: boolean): boolean {
  if (!date || completed) return false;
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isPast(startOfDay(dateObj)) && !isToday(dateObj);
}

export function getDaysOverdue(date: string | Date | null): number {
  if (!date) return 0;
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffTime = now.getTime() - dateObj.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
