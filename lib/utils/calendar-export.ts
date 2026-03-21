interface Activity {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  startTime?: string;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
}

interface DaySchedule {
  day: number;
  date: string;
  activities: Activity[];
}

/**
 * Generates an ICS (iCalendar) file from a travel schedule
 */
export function generateICSFile(schedule: DaySchedule[], tripName: string = 'Travel Itinerary'): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Travel Planner//NONSGML v1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${tripName}`,
    'X-WR-TIMEZONE:UTC',
  ].join('\r\n');

  schedule.forEach((day) => {
    const dayDate = new Date(day.date);

    day.activities.forEach((activity, index) => {
      // Parse start time or default to 9 AM + incremental hours
      let startHour = 9 + index * 2;
      let startMinute = 0;

      if (activity.startTime) {
        const [time, period] = activity.startTime.split(' ');
        const [hourStr, minuteStr] = time.split(':');
        let hour = parseInt(hourStr);
        const minute = parseInt(minuteStr || '0');

        if (period?.toUpperCase() === 'PM' && hour !== 12) {
          hour += 12;
        } else if (period?.toUpperCase() === 'AM' && hour === 12) {
          hour = 0;
        }

        startHour = hour;
        startMinute = minute;
      }

      const startDate = new Date(dayDate);
      startDate.setHours(startHour, startMinute, 0, 0);

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + activity.duration);

      const dtStart = formatICSDate(startDate);
      const dtEnd = formatICSDate(endDate);

      // Escape special characters in text fields
      const summary = escapeICSText(activity.name);
      const description = escapeICSText(activity.description);
      const location = escapeICSText(activity.location.name);

      ics += '\r\n' + [
        'BEGIN:VEVENT',
        `UID:${activity.id}@travel-planner.app`,
        `DTSTAMP:${timestamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'END:VEVENT',
      ].join('\r\n');
    });
  });

  ics += '\r\nEND:VCALENDAR';

  return ics;
}

/**
 * Formats a Date object to ICS datetime format (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escapes special characters for ICS format
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Downloads an ICS file to the user's device
 */
export function downloadICSFile(icsContent: string, filename: string = 'travel-itinerary.ics'): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Generates and downloads a calendar file from a travel schedule
 */
export function exportToCalendar(schedule: DaySchedule[], tripName?: string): void {
  const icsContent = generateICSFile(schedule, tripName);
  const filename = `${tripName?.toLowerCase().replace(/\s+/g, '-') || 'travel-itinerary'}.ics`;
  downloadICSFile(icsContent, filename);
}
