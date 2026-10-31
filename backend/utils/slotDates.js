// Doctor slots repeat weekly (e.g. "Monday 10:00 AM"). Each slot also carries the calendar
// date it is currently offered for, stored as midnight UTC of that day (like lab collection dates).
// An unbooked slot whose date has passed (or that has no date yet) moves to its next weekday.

export const DAY_MS = 24 * 60 * 60 * 1000;

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Midnight UTC of the given moment's day
export const startOfUtcDay = (value = new Date()) => {
  const date = new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

// Earliest day a slot can be offered for. Slots start from tomorrow so a slot whose time has
// already gone by today is never offered. (Server days are UTC; for timezones ahead of UTC,
// late-night bookings can still land on the patient's local "today".)
export const earliestSlotDate = (now = new Date()) => new Date(startOfUtcDay(now).getTime() + DAY_MS);

// First date on or after `from` that falls on the named weekday, or null for an unknown day name
export const nextWeekdayOnOrAfter = (dayName, from) => {
  const target = WEEKDAYS.indexOf(String(dayName).trim().toLowerCase());
  if (target === -1) return null;
  const start = startOfUtcDay(from);
  const offset = (target - start.getUTCDay() + 7) % 7;
  return new Date(start.getTime() + offset * DAY_MS);
};

// The date an unbooked slot is offered for right now: its stored date while still ahead,
// otherwise the next matching weekday. Booked slots keep the date they were booked for.
export const currentSlotDate = (slot, now = new Date()) => {
  const stored = slot.date ? startOfUtcDay(slot.date) : null;
  if (slot.isBooked) return stored;

  const earliest = earliestSlotDate(now);
  if (stored && stored >= earliest) return stored;
  return nextWeekdayOnOrAfter(slot.day, earliest);
};

// "10:00 AM" -> minutes since midnight, for ordering slots on the same day (unparseable times sort last)
const timeToMinutes = (time) => {
  const match = /^(\d{1,2}):(\d{2})\s*([AP]M)?$/i.exec(String(time).trim());
  if (!match) return Number.MAX_SAFE_INTEGER;
  const [, hourText, minuteText, meridiem] = match;
  // 12-hour times wrap 12 to 0 and add 12 for PM; times without AM/PM are already 24-hour
  const hours = meridiem
    ? (Number(hourText) % 12) + (meridiem.toUpperCase() === 'PM' ? 12 : 0)
    : Number(hourText);
  return hours * 60 + Number(minuteText);
};

// Plain doctor object for API responses, with every slot's current date filled in and
// slots listed in calendar order (slots without a usable date go last)
export const withSlotDates = (doctor, now = new Date()) => {
  const data = doctor.toObject();

  data.availableSlots = (data.availableSlots || [])
    .map((slot) => ({ ...slot, date: currentSlotDate(slot, now) }))
    .sort((a, b) => {
      const byDate = (a.date ? a.date.getTime() : Infinity) - (b.date ? b.date.getTime() : Infinity);
      if (byDate !== 0 && !Number.isNaN(byDate)) return byDate;
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    });

  return data;
};
