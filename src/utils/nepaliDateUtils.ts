// src/utils/nepaliDateUtils.ts

import { BsToAd, AdToBs } from "react-native-nepali-picker";

/**
 * Converts BS (YYYY-MM-DD) → AD ISO (YYYY-MM-DD)
 */
export function convertBSToADISO(bsDate: string): string | null {
  try {
    if (!bsDate) return null;

    const adDate = BsToAd(bsDate);

    return adDate ?? null;
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

    const bsDate = AdToBs(adIso);

    return bsDate ?? null;
  } catch {
    return null;
  }
}
