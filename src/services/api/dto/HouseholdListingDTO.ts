/**
 * EXACT shape returned by GetHHDataList API
 */
export interface HouseholdListingDTO {
  householD_ID: string;
  datE_OF_LISTING: string;
  datE_OF_LISTING_BS: string;

  namE_OF_CHW: string;
  namE_OF_CHW_ID: string;

  province: string;
  provincE_NAME: string;

  districT_ID: string;
  districT_NAME: string;

  vdcnP_CODE: string;
  vdcnP_NAME: string;

  warD_NO: string;
  address: string;

  gpS_COORDINATES: string | null;

  nO_OF_HOUSEHOLD_MEMBERS: number;
  typE_OF_HOUSING: string;

  accesS_TO_CLEAN_WATER: "Y" | "N";
  accesS_TO_SANITATION: "Y" | "N";

  createD_ON: string;
  createD_BY: string | null;

  activE_FLAG: "Y" | "N";

  hH_CLOSED_DATE: string | null;
  hH_CLOSED_DATE_BS: string | null;
}
