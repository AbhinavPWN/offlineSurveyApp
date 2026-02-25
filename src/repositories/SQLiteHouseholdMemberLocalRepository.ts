import { db } from "../db";
import { v4 as uuidv4 } from "uuid";
import {
  HouseholdMemberLocal,
  MemberSyncAction,
  MemberSyncStatus,
} from "../models/householdMember.model";
import { HouseholdMemberLocalRepository } from "./HouseholdMemberLocalRepository";
import { convertApiDateToISO } from "../utils/dateUtils";

function mapRowToMember(row: any): HouseholdMemberLocal {
  return {
    localId: row.id,
    clientNo: row.client_no ?? undefined,
    householdLocalId: row.household_local_id,

    syncStatus: row.sync_status as MemberSyncStatus,
    syncAction: row.sync_action as MemberSyncAction,

    enrollDateAD: row.enroll_date_ad ?? undefined,
    enrollDateBS: row.enroll_date_bs ?? undefined,

    firstName: row.first_name ?? undefined,
    middleName: row.middle_name ?? undefined,
    lastName: row.last_name ?? undefined,
    gender: row.gender ?? undefined,
    maritalStatus: row.marital_status ?? undefined,
    religionCode: row.religion_code ?? undefined,
    casteCode: row.caste_code ?? undefined,
    relationToHH: row.relation_to_hh ?? undefined,
    headHousehold: row.head_household ?? undefined,

    idDocumentType: row.id_document_type ?? undefined,
    idDocumentNo: row.id_document_no ?? undefined,
    idIssueDistrictCode: row.id_issue_district_code ?? undefined,
    idIssueDateAD: row.id_issue_date_ad ?? undefined,
    idIssueDateBS: row.id_issue_date_bs ?? undefined,

    dobAD: row.dob_ad ?? undefined,
    dobBS: row.dob_bs ?? undefined,

    mobileNo: row.mobile_no ?? undefined,
    minorYn: row.minor_yn ?? undefined,

    address1Type: row.address1_type ?? undefined,
    address: row.address ?? undefined,
    address1Line2: row.address1_line2 ?? undefined,
    address1Line3: row.address1_line3 ?? undefined,
    address1DistrictCode: row.address1_district_code ?? undefined,
    address1Province: row.address1_province ?? undefined,

    occupationCode: row.occupation_code ?? undefined,
    educationCode: row.education_code ?? undefined,
    employeeId: row.employee_id ?? undefined,
    tranOfficeCode: row.tran_office_code ?? undefined,

    totalAsset: row.total_asset ?? undefined,
    totalLiabilities: row.total_liabilities ?? undefined,
    netWorth: row.net_worth ?? undefined,
    soiSalary: row.soi_salary ?? undefined,
    soiBusIncome: row.soi_bus_income ?? undefined,
    soiReturnfrmInvest: row.soi_returnfrminvest ?? undefined,
    soiInheritance: row.soi_inheritance ?? undefined,
    soiRemittance: row.soi_remittance ?? undefined,
    soiOthers: row.soi_others ?? undefined,
    soiAgriculture: row.soi_agriculture ?? undefined,

    healthConditionsYn: row.health_conditions_yn ?? undefined,
    healthConditions: row.health_conditions ?? undefined,
    disabilityIdentYn: row.disability_ident_yn ?? undefined,
    disabilityIdent: row.disability_ident ?? undefined,
    seeing: row.seeing ?? undefined,
    hearing: row.hearing ?? undefined,
    walking: row.walking ?? undefined,
    remembering: row.remembering ?? undefined,
    selfCare: row.self_care ?? undefined,
    communicating: row.communicating ?? undefined,
    disabilityStatus: row.disability_status ?? undefined,
    pregnancyStatus: row.pregnancy_status ?? undefined,
    pregnancyDate: row.pregnancy_date ?? undefined,
    vaccinationStatus: row.vaccination_status ?? undefined,
    healthInsCoverage: row.health_ins_coverage ?? undefined,

    clientBehaviour: row.client_behaviour ?? undefined,
    imagePath: row.image_path ?? undefined,
    imageUploadStatus: row.image_upload_status ?? undefined,

    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

export class SQLiteHouseholdMemberLocalRepository implements HouseholdMemberLocalRepository {
  async recalculateMemberCount(householdLocalId: string): Promise<void> {
    await db.runAsync(
      `
    UPDATE households
    SET household_member_count = (
      SELECT COUNT(*)
      FROM household_members
      WHERE household_local_id = ?
        AND deleted_at IS NULL
    ),
    updated_at = ?
    WHERE id = ?
    `,
      [householdLocalId, new Date().toISOString(), householdLocalId],
    );
  }

  async createDraftMember(
    householdLocalId: string,
  ): Promise<HouseholdMemberLocal> {
    const id = uuidv4();
    const nowIso = new Date().toISOString();

    await db.runAsync(
      `
    INSERT INTO household_members (
      id,
      client_no,
      household_local_id,
      sync_status,
      sync_action,
      head_household,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [id, null, householdLocalId, "DRAFT", null, "N", nowIso, nowIso],
    );

    // Maintain aggregate consistency
    await this.recalculateMemberCount(householdLocalId);

    const row = await db.getFirstAsync<any>(
      `
    SELECT *
    FROM household_members
    WHERE id = ?
    `,
      [id],
    );

    if (!row) {
      throw new Error("Failed to create draft member");
    }

    return mapRowToMember(row);
  }

  async updateDraft(
    localId: string,
    patch: Partial<HouseholdMemberLocal>,
  ): Promise<void> {
    const existing = await this.getByLocalId(localId);
    if (!existing) {
      throw new Error("Member not found");
    }

    const fieldMap: Record<string, string> = {
      enrollDateAD: "enroll_date_ad",
      enrollDateBS: "enroll_date_bs",
      firstName: "first_name",
      middleName: "middle_name",
      lastName: "last_name",
      gender: "gender",
      maritalStatus: "marital_status",
      religionCode: "religion_code",
      casteCode: "caste_code",
      relationToHH: "relation_to_hh",
      headHousehold: "head_household",
      idDocumentType: "id_document_type",
      idDocumentNo: "id_document_no",
      idIssueDistrictCode: "id_issue_district_code",
      idIssueDateAD: "id_issue_date_ad",
      idIssueDateBS: "id_issue_date_bs",
      dobAD: "dob_ad",
      dobBS: "dob_bs",
      mobileNo: "mobile_no",
      minorYn: "minor_yn",
      address1Type: "address1_type",
      address: "address",
      address1Line2: "address1_line2",
      address1Line3: "address1_line3",
      address1DistrictCode: "address1_district_code",
      address1Province: "address1_province",
      occupationCode: "occupation_code",
      educationCode: "education_code",
      employeeId: "employee_id",
      tranOfficeCode: "tran_office_code",
      totalAsset: "total_asset",
      totalLiabilities: "total_liabilities",
      soiSalary: "soi_salary",
      soiBusIncome: "soi_bus_income",
      soiReturnfrmInvest: "soi_returnfrminvest",
      soiInheritance: "soi_inheritance",
      soiRemittance: "soi_remittance",
      soiOthers: "soi_others",
      soiAgriculture: "soi_agriculture",
      healthConditionsYn: "health_conditions_yn",
      healthConditions: "health_conditions",
      disabilityIdentYn: "disability_ident_yn",
      disabilityIdent: "disability_ident",
      seeing: "seeing",
      hearing: "hearing",
      walking: "walking",
      remembering: "remembering",
      selfCare: "self_care",
      communicating: "communicating",
      disabilityStatus: "disability_status",
      pregnancyStatus: "pregnancy_status",
      pregnancyDate: "pregnancy_date",
      vaccinationStatus: "vaccination_status",
      healthInsCoverage: "health_ins_coverage",
      clientBehaviour: "client_behaviour",
      imagePath: "image_path",
      imageUploadStatus: "image_upload_status",
    };

    const setClauses: string[] = [];
    const values: any[] = [];

    // Auto net worth calculation
    const totalAsset = patch.totalAsset ?? existing.totalAsset ?? "0";
    const totalLiabilities =
      patch.totalLiabilities ?? existing.totalLiabilities ?? "0";

    const netWorth = Number(totalAsset || 0) - Number(totalLiabilities || 0);

    patch.netWorth = String(netWorth);

    fieldMap["netWorth"] = "net_worth";

    for (const key of Object.keys(patch)) {
      const column = fieldMap[key];
      const value = (patch as any)[key];
      if (!column || value === undefined) continue;

      setClauses.push(`${column} = ?`);
      values.push(value);
    }

    // Head rule enforcement
    if (patch.headHousehold === "Y") {
      await this.clearHeadFlagForHousehold(existing.householdLocalId);
    }

    if (setClauses.length === 0) return;

    setClauses.push("updated_at = ?");
    values.push(new Date().toISOString());

    // If already synced → mark pending
    if (existing.syncStatus === "SYNCED") {
      setClauses.push("sync_status = ?");
      values.push("PENDING");

      setClauses.push("sync_action = ?");
      values.push("UPDATE");
    }

    await db.runAsync(
      `
    UPDATE household_members
    SET ${setClauses.join(", ")}
    WHERE id = ?
    `,
      [...values, localId],
    );
  }

  async getByLocalId(localId: string): Promise<HouseholdMemberLocal | null> {
    const row = await db.getFirstAsync<any>(
      `
    SELECT *
    FROM household_members
    WHERE id = ?
      AND deleted_at IS NULL
    `,
      [localId],
    );

    return row ? mapRowToMember(row) : null;
  }

  async listByHousehold(
    householdLocalId: string,
  ): Promise<HouseholdMemberLocal[]> {
    const rows = await db.getAllAsync<any>(
      `
    SELECT *
    FROM household_members
    WHERE household_local_id = ?
      AND deleted_at IS NULL
    ORDER BY created_at ASC
    `,
      [householdLocalId],
    );

    return rows.map(mapRowToMember);
  }

  async clearHeadFlagForHousehold(householdLocalId: string): Promise<void> {
    await db.runAsync(
      `
    UPDATE household_members
    SET head_household = 'N',
        updated_at = ?
    WHERE household_local_id = ?
      AND deleted_at IS NULL
    `,
      [new Date().toISOString(), householdLocalId],
    );
  }

  async listBySyncStatus(status: string): Promise<HouseholdMemberLocal[]> {
    const rows = await db.getAllSync<any>(
      `
        SELECT *
        FROM household_members
        WHERE sync_status = ?
            AND deleted_at IS NULL
        `,
      [status],
    );
    return rows.map(mapRowToMember);
  }

  async markPending(
    localId: string,
    action: "INSERT" | "UPDATE",
  ): Promise<void> {
    await db.runAsync(
      `
    UPDATE household_members
    SET sync_status = ?,
        sync_action = ?,
        updated_at = ?
    WHERE id = ?
      AND deleted_at IS NULL
    `,
      ["PENDING", action, new Date().toISOString(), localId],
    );
  }

  async markSynced(localId: string, clientNo: string): Promise<void> {
    await db.runAsync(
      `
    UPDATE household_members
    SET client_no = ?,
        sync_status = ?,
        sync_action = NULL,
        updated_at = ?
    WHERE id = ?
    `,
      [clientNo, "SYNCED", new Date().toISOString(), localId],
    );
  }

  async markFailed(localId: string): Promise<void> {
    await db.runAsync(
      `
    UPDATE household_members
    SET sync_status = ?,
        updated_at = ?
    WHERE id = ?
    `,
      ["FAILED", new Date().toISOString(), localId],
    );
  }

  async softDelete(localId: string): Promise<void> {
    const existing = await this.getByLocalId(localId);
    if (!existing) return;

    await db.runAsync(
      `
    UPDATE household_members
    SET deleted_at = ?,
        updated_at = ?
    WHERE id = ?
    `,
      [new Date().toISOString(), new Date().toISOString(), localId],
    );

    await this.recalculateMemberCount(existing.householdLocalId);
  }

  async markAllDraftMembersPending(householdLocalId: string): Promise<void> {
    await db.runAsync(
      `
    UPDATE household_members
    SET sync_status = 'PENDING',
        sync_action = CASE
            WHEN client_no IS NULL THEN 'INSERT'
            ELSE 'UPDATE'
        END,
        updated_at = ?
    WHERE household_local_id = ?
      AND deleted_at IS NULL
    `,
      [new Date().toISOString(), householdLocalId],
    );
  }

  async insertManyFromListing(
    members: any[],
    householdLocalId: string,
  ): Promise<void> {
    console.log("💾 Inserting members:", members.length);
    const nowIso = new Date().toISOString();

    for (const m of members) {
      const localId = uuidv4();

      const values = [
        localId,
        m.clienT_NO,
        householdLocalId,
        "SYNCED",
        null,
        convertApiDateToISO(m.enrolL_DATE),
        m.enrolL_DATE_BS,
        m.fname,
        m.middlE_NAME,
        m.lname,
        m.gender,
        m.maritaL_STATUS,
        m.religioN_CODE,
        m.castE_CODE,
        m.relationshiP_TO_HEAD_HOUSEHOLD,
        m.heaD_HOUSEHOLD ?? "N",
        m.iD_DOCUMENT_TYPE,
        m.iD_DOCUMENT_NO,
        m.iD_ISSUE_DISTRICT_CODE,
        convertApiDateToISO(m.meM_IDENTITY_ISSUE_DATE),
        m.meM_IDENTITY_ISSUE_DATE_BS,
        convertApiDateToISO(m.dob),
        m.doB_BS,
        m.mobilE_NO,
        m.minoR_Y_N,
        m.addresS_1_TYPE,
        m.address,
        m.addresS_1_LINE2,
        m.addresS_1_LINE3,
        m.addresS_1_DISTRICT,
        m.provincE1,
        m.occupatioN_CODE,
        m.educatioN_CODE,
        m.employeE_ID,
        m.traN_OFFICE_CODE,
        String(m.totaL_ASSET ?? ""),
        String(m.totaL_LIABILITIES ?? ""),
        String(m.neT_WORTH ?? ""),
        m.soI_SALARY,
        m.soI_BUS_INCOME,
        m.soI_RETURN_FRM_INVEST,
        m.soI_INHERITANCE,
        m.soI_REMITTANCE,
        m.soI_OTHERS,
        m.soI_AGRICULTURE,
        m.healtH_CONDITIONS ? "Y" : "N",
        m.healtH_CONDITIONS,
        m.disabilitY_IDENTIFICATION ? "Y" : "N",
        m.disabilitY_IDENTIFICATION,
        m.seeing,
        m.hearing,
        m.walking,
        m.remembering,
        m.selF_CARE,
        m.communicating,
        m.disabilitY_STATUS,
        m.pregnancY_STATUS,
        convertApiDateToISO(m.pregnancY_DATE),
        m.vaccinatioN_STATUS,
        m.healtH_INSURANCE_COVERAGE,
        m.clienT_BEHAVIOUR,
        m.imagE_PATH,
        nowIso,
        nowIso,
        null, // image_upload_status
        null, // deleted_at
      ];

      // Generate placeholders automatically
      const placeholders = values.map(() => "?").join(",");

      await db.runAsync(
        `
  INSERT INTO household_members (
    id,
    client_no,
    household_local_id,
    sync_status,
    sync_action,
    enroll_date_ad,
    enroll_date_bs,
    first_name,
    middle_name,
    last_name,
    gender,
    marital_status,
    religion_code,
    caste_code,
    relation_to_hh,
    head_household,
    id_document_type,
    id_document_no,
    id_issue_district_code,
    id_issue_date_ad,
    id_issue_date_bs,
    dob_ad,
    dob_bs,
    mobile_no,
    minor_yn,
    address1_type,
    address,
    address1_line2,
    address1_line3,
    address1_district_code,
    address1_province,
    occupation_code,
    education_code,
    employee_id,
    tran_office_code,
    total_asset,
    total_liabilities,
    net_worth,
    soi_salary,
    soi_bus_income,
    soi_returnfrminvest,
    soi_inheritance,
    soi_remittance,
    soi_others,
    soi_agriculture,
    health_conditions_yn,
    health_conditions,
    disability_ident_yn,
    disability_ident,
    seeing,
    hearing,
    walking,
    remembering,
    self_care,
    communicating,
    disability_status,
    pregnancy_status,
    pregnancy_date,
    vaccination_status,
    health_ins_coverage,
    client_behaviour,
    image_path,
    created_at,
    updated_at,
    image_upload_status,
    deleted_at
  )
  VALUES (${placeholders})
  `,
        values,
      );
      console.log("💾 Inserting member clientNo:", m.clienT_NO);
    }

    await this.recalculateMemberCount(householdLocalId);
  }
}
