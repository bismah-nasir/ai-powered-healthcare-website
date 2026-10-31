// Slot and appointment dates are calendar days stored as midnight UTC, so they are
// formatted in UTC to show the same day everywhere (e.g. "Mon, 2 Nov")
export const formatSlotDate = (value, options = {}) =>
  new Date(value).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    ...options,
  });

// A slot or appointment's date with the year, falling back to the weekday name
// for slots and appointments booked before they had dates
export const formatAppointmentDate = (item) =>
  item?.date ? formatSlotDate(item.date, { year: 'numeric' }) : item?.day;

// Today in the viewer's local calendar as 'YYYY-MM-DD'
const localTodayKey = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// True once the appointment's day has arrived (appointments without a date count as arrived)
export const isAppointmentDue = (appointment) =>
  !appointment.date || String(appointment.date).slice(0, 10) <= localTodayKey();

// True once the appointment's day is over (appointments without a date never count as past)
export const isAppointmentPast = (appointment) =>
  Boolean(appointment.date) && String(appointment.date).slice(0, 10) < localTodayKey();
