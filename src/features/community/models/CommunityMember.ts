export interface CommunityMember {
  householdId: string;
  clientNo: string;

  districtId: string;
  districtName: string;

  municipalityName: string;
  vdcnpCode: string;
  wardNo: string | null;
  address: string;

  householdHeadName: string;
  memberName: string;
  relationship: string;

  gender: string;
  clientAge: number | null;

  pregnancyStatus: string;
  pregnancyDate: string | null;

  motherOfChild: string;
  childDob: string | null;
}
