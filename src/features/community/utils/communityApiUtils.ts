const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

const COMMUNITY_API_MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

/**
 * Converts an AD ISO date such as 2026-07-10
 * into the Community API format: 10-jul-2026.
 */
export function formatCommunityApiDate(
  adIsoDate?: string | null,
): string | null {
  if (!adIsoDate) return null;

  const match = ISO_DATE_REGEX.exec(adIsoDate);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12) return null;

  const validationDate = new Date(Date.UTC(year, month - 1, day));

  const isValidDate =
    validationDate.getUTCFullYear() === year &&
    validationDate.getUTCMonth() === month - 1 &&
    validationDate.getUTCDate() === day;

  if (!isValidDate) return null;

  const formattedDay = String(day).padStart(2, "0");
  const formattedMonth = COMMUNITY_API_MONTHS[month - 1];

  return `${formattedDay}-${formattedMonth}-${year}`;
}
