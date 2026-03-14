import { db } from "../db";
import { v4 as uuidv4 } from "uuid";
import {
  HouseholdMemberLocal,
  MemberSyncAction,
  MemberSyncStatus,
} from "../models/householdMember.model";
import { HouseholdMemberLocalRepository } from "./HouseholdMemberLocalRepository";
// import { convertApiDateToISO } from "../utils/dateUtils";
import { mapServerMemberToDb } from "../services/api/mappers/ServerMemberMapper";

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

    clientAge: row.client_age ?? undefined,

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
    pregnancyDateAD: row.pregnancy_date ?? undefined,
    childDobAD: row.child_dob ?? undefined,

    motherofChild: row.mother_of_child ?? undefined,
    // childDob: row.child_dob ?? undefined,

    vaccinationStatus: row.vaccination_status ?? undefined,
    healthInsCoverage: row.health_ins_coverage ?? undefined,

    healthConditionsDia: row.health_conditions_dia ?? undefined,
    healthConditionsHyp: row.health_conditions_hyp ?? undefined,
    healthConditionsCar: row.health_conditions_car ?? undefined,
    healthConditionsChr: row.health_conditions_chr ?? undefined,
    healthConditionsOth: row.health_conditions_oth ?? undefined,
    healthConditionsOthers: row.health_conditions_others ?? undefined,

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
    const fieldMap: Record<string, string> = {
      enrollDateAD: "enroll_date_ad",
      firstName: "first_name",
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
      dobAD: "dob_ad",
      clientAge: "client_age",
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
      totalAsset: "total_asset",
      totalLiabilities: "total_liabilities",
      netWorth: "net_worth",
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
      pregnancyDateAD: "pregnancy_date",
      motherofChild: "mother_of_child",
      childDobAD: "child_dob",
      vaccinationStatus: "vaccination_status",
      healthInsCoverage: "health_ins_coverage",
      healthConditionsDia: "health_conditions_dia",
      healthConditionsHyp: "health_conditions_hyp",
      healthConditionsCar: "health_conditions_car",
      healthConditionsChr: "health_conditions_chr",
      healthConditionsOth: "health_conditions_oth",
      healthConditionsOthers: "health_conditions_others",
      clientBehaviour: "client_behaviour",
      imagePath: "image_path",
    };

    const setClauses: string[] = [];
    const values: any[] = [];

    for (const key of Object.keys(patch)) {
      const column = fieldMap[key];
      const value = (patch as any)[key];
      if (!column || value === undefined) continue;

      setClauses.push(`${column} = ?`);
      values.push(value);
    }

    if (setClauses.length === 0) return;

    setClauses.push("updated_at = ?");
    values.push(new Date().toISOString());

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
    const rows = await db.getAllAsync<any>(
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

      // 🔐 Hardened normalization layer
      const mapped = mapServerMemberToDb(m, householdLocalId);

      const values = [
        localId,
        mapped.clientNo ?? null,
        mapped.householdLocalId,
        "SYNCED",
        null, // sync_action

        mapped.enrollDateAD ?? null,
        mapped.enrollDateBS ?? null,

        mapped.firstName ?? null,
        mapped.middleName ?? null,
        mapped.lastName ?? null,

        mapped.gender ?? null,
        mapped.maritalStatus ?? null,
        mapped.religionCode ?? null,
        mapped.casteCode ?? null,
        mapped.relationToHH ?? null,

        mapped.headHousehold ?? "N",

        mapped.idDocumentType ?? null,
        mapped.idDocumentNo ?? null,
        mapped.idIssueDistrictCode ?? null,
        mapped.idIssueDateAD ?? null,
        mapped.idIssueDateBS ?? null,

        mapped.dobAD ?? null,
        mapped.dobBS ?? null,
        mapped.clientAge ?? null,

        mapped.mobileNo ?? null,
        mapped.minorYn ?? "N",

        mapped.address1Type ?? null,
        mapped.address ?? null,
        mapped.address1Line2 ?? null,
        mapped.address1Line3 ?? null,
        mapped.address1DistrictCode ?? null,
        mapped.address1Province ?? null,

        mapped.occupationCode ?? null,
        mapped.educationCode ?? null,
        mapped.employeeId ?? null,
        mapped.tranOfficeCode ?? null,

        mapped.totalAsset ?? "0",
        mapped.totalLiabilities ?? "0",
        mapped.netWorth ?? "0",

        mapped.soiSalary ?? "N",
        mapped.soiBusIncome ?? "N",
        mapped.soiReturnfrmInvest ?? "N",
        mapped.soiInheritance ?? "N",
        mapped.soiRemittance ?? "N",
        mapped.soiOthers ?? "N",
        mapped.soiAgriculture ?? "N",

        mapped.healthConditionsYn ?? "N",
        mapped.healthConditions ?? null,

        mapped.disabilityIdentYn ?? "N",
        mapped.disabilityIdent ?? null,

        mapped.seeing ?? "N",
        mapped.hearing ?? "N",
        mapped.walking ?? "N",
        mapped.remembering ?? "N",
        mapped.selfCare ?? "N",
        mapped.communicating ?? "N",

        mapped.disabilityStatus ?? "N",

        mapped.pregnancyStatus ?? "N",
        mapped.pregnancyDateAD ?? null,

        mapped.motherofChild ?? "N",
        mapped.childDobAD ?? null,

        mapped.vaccinationStatus ?? "N",
        mapped.healthInsCoverage ?? "N",
        mapped.healthConditionsDia ?? "N",
        mapped.healthConditionsHyp ?? "N",
        mapped.healthConditionsCar ?? "N",
        mapped.healthConditionsChr ?? "N",
        mapped.healthConditionsOth ?? "N",
        mapped.healthConditionsOthers ?? null,

        mapped.clientBehaviour ?? null,
        mapped.imagePath ?? null,

        nowIso,
        nowIso,

        null, // image_upload_status
        null, // deleted_at
      ];

      const placeholders = values.map(() => "?").join(",");
      const sanitizedValues = values.map((v) => (v === undefined ? null : v));
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
        client_age,
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
        mother_of_child,
        child_dob,
        vaccination_status,
        health_ins_coverage,
        health_conditions_dia,
        health_conditions_hyp,
        health_conditions_car,
        health_conditions_chr,
        health_conditions_oth,
        health_conditions_others,
        client_behaviour,
        image_path,
        created_at,
        updated_at,
        image_upload_status,
        deleted_at
      )
      VALUES (${placeholders})
      `,
        sanitizedValues,
      );

      console.log("💾 Inserted member clientNo:", mapped.clientNo);
    }

    await this.recalculateMemberCount(householdLocalId);
  }
}
