import { CommunityMember } from "@/src/features/community/models/CommunityMember";
import { CommunityMemberDTO } from "@/src/services/api/dto/CommunityDTO";

function normalizeString(value: unknown): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeNullableString(value: unknown): string | null {
  const normalized = normalizeString(value);
  return normalized.length > 0 ? normalized : null;
}

function normalizeAge(value: unknown): number | null {
  const normalized = normalizeString(value);

  if (!normalized) return null;

  const age = Number(normalized);

  if (!Number.isInteger(age) || age < 0 || age > 120) {
    return null;
  }

  return age;
}

/**
 * Current Community GET response does not contain wardNo.
 * The documented household ID format is:
 *
 * province-district-vdcnp-ward-household
 *
 * Example: 5-511-51106-13-3 -> ward 13
 */
export function extractWardNoFromHouseholdId(
  householdId: unknown,
): string | null {
  const normalizedHouseholdId = normalizeString(householdId);
  const parts = normalizedHouseholdId.split("-");

  if (parts.length < 5) return null;

  const wardNo = parts[3]?.trim();

  if (!wardNo || !/^\d+$/.test(wardNo)) {
    return null;
  }

  return wardNo;
}

export function mapCommunityMemberDto(
  dto: CommunityMemberDTO,
): CommunityMember {
  const householdId = normalizeString(dto.householD_ID);

  return {
    householdId,
    clientNo: normalizeString(dto.clienT_NO),

    districtId: normalizeString(dto.districT_ID),
    districtName: normalizeString(dto.districT_NAME),

    municipalityName: normalizeString(dto.locaL_DEVELOPMENT),
    vdcnpCode: normalizeString(dto.vdcnP_CODE),
    wardNo: extractWardNoFromHouseholdId(householdId),
    address: normalizeString(dto.address),

    householdHeadName: normalizeString(dto.householD_HEAD_NAME),
    memberName: normalizeString(dto.membeR_NAME),
    relationship: normalizeString(dto.relationship),

    gender: normalizeString(dto.gender).toUpperCase(),
    clientAge: normalizeAge(dto.clienT_AGE),

    pregnancyStatus: normalizeString(dto.pregnancY_STATUS).toUpperCase(),
    pregnancyDate: normalizeNullableString(dto.pregnancY_DATE),

    motherOfChild: normalizeString(dto.motheR_OF_CHILD).toUpperCase(),
    childDob: normalizeNullableString(dto.chilD_DOB),
  };
}
