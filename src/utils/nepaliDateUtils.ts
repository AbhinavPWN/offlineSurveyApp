// src/utils/nepaliDateUtils.ts

import DateConverter from "@remotemerge/nepali-date-converter";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates an AD/Gregorian ISO date (YYYY-MM-DD).
 *
 * Important:
 * This validation is only for AD dates.
 * BS dates must not be validated using JavaScript Date because
 * Bikram Sambat month/day rules are different.
 */
function isValidIsoDate(iso: string): boolean {
  if (!ISO_DATE_REGEX.test(iso)) return false;

  const [year, month, day] = iso.split("-").map(Number);

  if (!year || !month || !day) return false;

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const dt = new Date(`${iso}T00:00:00.000Z`);

  if (Number.isNaN(dt.getTime())) return false;

  const yyyy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}` === iso;
}

/**
 * Converts BS (YYYY-MM-DD) → AD ISO (YYYY-MM-DD)
 *
 * Returns null when:
 * - value is empty
 * - format is invalid
 * - BS date is invalid
 * - date is outside the converter's supported range
 */
export function convertBSToADISO(bsDate: string): string | null {
  try {
    if (!bsDate) return null;

    // Preserve the existing YYYY-MM-DD contract used by the app.
    if (!ISO_DATE_REGEX.test(bsDate)) return null;

    const converted = new DateConverter(bsDate).toAd();

    if (!converted) return null;

    const year = String(converted.year);
    const month = String(converted.month).padStart(2, "0");
    const day = String(converted.date).padStart(2, "0");

    const adDate = `${year}-${month}-${day}`;

    // Final safety check because this result is an AD date.
    if (!isValidIsoDate(adDate)) return null;

    return adDate;
  } catch {
    return null;
  }
}

/**
 * Converts AD ISO (YYYY-MM-DD) → BS ISO (YYYY-MM-DD)
 *
 * Returns null when:
 * - value is empty
 * - AD date is invalid
 * - conversion fails
 * - date is outside the converter's supported range
 */
export function convertADToBSISO(adIso: string): string | null {
  try {
    if (!adIso) return null;

    // Preserve existing AD validation behaviour.
    if (!isValidIsoDate(adIso)) return null;

    const converted = new DateConverter(adIso).toBs();

    if (!converted) return null;

    const year = String(converted.year);
    const month = String(converted.month).padStart(2, "0");
    const day = String(converted.date).padStart(2, "0");

    const bsDate = `${year}-${month}-${day}`;

    // Keep the same YYYY-MM-DD format expected by BSDateInput.
    if (!ISO_DATE_REGEX.test(bsDate)) return null;

    return bsDate;
  } catch {
    return null;
  }
}
