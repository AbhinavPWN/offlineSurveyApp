import { HouseholdListingDTO } from "../dto/HouseholdListingDTO";
import { Household } from "../../../domain/models/Household";

/**
 * Convert API listing DTO → internal Household model
 */
export function mapListingDtoToHousehold(dto: HouseholdListingDTO): Household {
  return {
    householdId: dto.householD_ID,

    source: "LISTING",
    syncStatus: "SYNCED",

    dateOfListingAD: dto.datE_OF_LISTING,
    dateOfListingBS: dto.datE_OF_LISTING_BS,

    chwId: dto.namE_OF_CHW_ID,
    chwName: dto.namE_OF_CHW,

    provinceId: dto.province,
    provinceName: dto.provincE_NAME,

    districtId: dto.districT_ID,
    districtName: dto.districT_NAME,

    municipalityCode: dto.vdcnP_CODE,
    municipalityName: dto.vdcnP_NAME,

    wardNo: Number(dto.warD_NO),
    address: dto.address,

    gpsCoordinates: dto.gpS_COORDINATES,

    memberCount: dto.nO_OF_HOUSEHOLD_MEMBERS,
    housingType: dto.typE_OF_HOUSING,

    hasCleanWater: dto.accesS_TO_CLEAN_WATER === "Y",
    hasSanitation: dto.accesS_TO_SANITATION === "Y",

    isActive: dto.activE_FLAG === "Y",
    closedDateAD: dto.hH_CLOSED_DATE,
    closedDateBS: dto.hH_CLOSED_DATE_BS,

    createdOn: dto.createD_ON,
  };
}
