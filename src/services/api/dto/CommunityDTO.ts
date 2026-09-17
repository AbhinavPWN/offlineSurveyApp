export type CommunityCategoryNo =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10";

export type CommunityMemberCategory =
  | "1" // Reproductive Women
  | "2" // Pregnant Women
  | "3" // Adolescent Girls
  | "4"; // Adolescent Boys

export type YesNo = "Y" | "N";

// Community-member download

export interface CommunityMemberListParams {
  EmpId: string;
  CategoryNo: CommunityCategoryNo;
  MemCategory: CommunityMemberCategory;
}

/**
 * Raw member object returned by
 * Get_Community_Member_List.
 *
 * Property casing intentionally matches the backend response.
 */
export interface CommunityMemberDTO {
  householD_ID: string;
  clienT_NO: string;

  districT_ID: string;
  districT_NAME: string;

  locaL_DEVELOPMENT: string;
  vdcnP_CODE: string;

  address: string;

  householD_HEAD_NAME: string;
  membeR_NAME: string;
  relationship: string;

  gender: string;
  clienT_AGE: number;

  pregnancY_STATUS: string;
  pregnancY_DATE: string | null;

  motheR_OF_CHILD: string;
  chilD_DOB: string | null;
}

export interface CommunityMemberListResponse {
  request_id: string;
  response_code: string;
  response_message: string;
  properties: CommunityMemberDTO[];
}

// Community Visit Entry

export interface CommunityVisitEntryPayload {
  visitDate: string;
  supervisorId: string;

  communityName: string;
  address: string;
  communityCategory: string;

  noOfPresent: string;
  noOfFemales: string;
  noOfMales: string;
  noOfPwd: string;

  sessionTopicNut: YesNo;
  sessionTopicHealthly: YesNo;
  sessionTopicDrug: YesNo;
  sessionTopicChild: YesNo;
  sessionTopicHeat: YesNo;
  sessionTopicMalaria: YesNo;
  sessionTopicDiarrhoea: YesNo;
  sessionTopicGbv: YesNo;

  userId: string;
  insertUpdate: "I";
}

export interface CommunityVisitEntryResponse {
  community_visit_id: string;
  response_code: string;
  response_message: string;
}

// Community Visit Attendance Entry

export interface CommunityAttendanceEntryPayload {
  communityVisitId: string;

  clientNo: string;
  visitorName: string;

  districtId: string;
  vdcnpCode: string;
  wardNo: string;
  address: string;

  createdBy: string;
  createdOn: string;

  insertUpdate: "I";
}

export interface CommunityAttendanceEntryResponse {
  community_visit_id: string;
  response_code: string;
  response_message: string;
}
