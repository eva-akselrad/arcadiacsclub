import type { EventRow } from '../env.d';

function formatIcsDate(iso: string, allDay: boolean): string {
  const date = new Date(iso);
  if (allDay) {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function eventsToIcs(events: EventRow[], calendarName = 'Arcadia CS Club'): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Arcadia CS Club//arcadiacs.club//EN',
    `X-WR-CALNAME:${escapeIcs(calendarName)}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const event of events) {
    const allDay = event.all_day === 1;
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:event-${event.id}@arcadiacs.club`);
    lines.push(`DTSTAMP:${formatIcsDate(new Date().toISOString(), false)}Z`);
    if (allDay) {
      lines.push(`DTSTART;VALUE=DATE:${formatIcsDate(event.start_at, true)}`);
      lines.push(`DTEND;VALUE=DATE:${formatIcsDate(event.end_at, true)}`);
    } else {
      lines.push(`DTSTART:${formatIcsDate(event.start_at, false)}Z`);
      lines.push(`DTEND:${formatIcsDate(event.end_at, false)}Z`);
    }
    lines.push(`SUMMARY:${escapeIcs(event.title)}`);
    if (event.description) {
      lines.push(`DESCRIPTION:${escapeIcs(event.description)}`);
    }
    if (event.location) {
      lines.push(`LOCATION:${escapeIcs(event.location)}`);
    }
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function singleEventToIcs(event: EventRow): string {
  return eventsToIcs([event], event.title);
}
