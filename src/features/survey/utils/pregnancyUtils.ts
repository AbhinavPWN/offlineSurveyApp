import {
  convertADToBSISO,
  convertBSToADISO,
} from "@/src/utils/nepaliDateUtils";

// Standard EDD = LMP + 280 days
const PREGNANCY_DURATION_DAYS = 280;

export function calculateEDDFromLMP(lmpBsDate: string): string | null {
  try {
    // BS -> AD
    const adIso = convertBSToADISO(lmpBsDate);

    if (!adIso) return null;

    // Create AD date
    const adDate = new Date(`${adIso}T00:00:00`);

    if (Number.isNaN(adDate.getTime())) {
      return null;
    }

    // Add 280 days
    adDate.setDate(adDate.getDate() + PREGNANCY_DURATION_DAYS);

    // Back to ISO
    const yyyy = adDate.getFullYear();
    const mm = String(adDate.getMonth() + 1).padStart(2, "0");
    const dd = String(adDate.getDate()).padStart(2, "0");

    const eddAdIso = `${yyyy}-${mm}-${dd}`;

    // AD -> BS
    return convertADToBSISO(eddAdIso);
  } catch {
    return null;
  }
}
