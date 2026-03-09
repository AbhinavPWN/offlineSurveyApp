// src/utils/nepaliDateUtils.ts

import { BsToAd, AdToBs } from "react-native-nepali-picker";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

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
 */
export function convertBSToADISO(bsDate: string): string | null {
  try {
    if (!bsDate) return null;
    if (!ISO_DATE_REGEX.test(bsDate)) return null;

    const adDate = BsToAd(bsDate);
    if (!adDate || !isValidIsoDate(adDate)) return null;

    return adDate;
  } catch {
    return null;
  }
}

/**
 * Converts AD ISO (YYYY-MM-DD) → BS ISO (YYYY-MM-DD)
 */
export function convertADToBSISO(adIso: string): string | null {
  try {
    if (!adIso) return null;
    if (!isValidIsoDate(adIso)) return null;

    const bsDate = AdToBs(adIso);
    if (!bsDate || !ISO_DATE_REGEX.test(bsDate)) return null;

    return bsDate;
  } catch {
    return null;
  }
}
