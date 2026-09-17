import { db } from "../db";
import { CommunityMember } from "../features/community/models/CommunityMember";
import {
  CommunityMemberFilter,
  CommunityMemberLocalRepository,
  SaveCommunityMembersInput,
  SaveCommunityMembersSummary,
} from "../features/community/repositories/CommunityMemberLocalRepository";

interface CommunityMemberRow {
  household_id: string;
  client_no: string;
  district_id: string;
  district_name: string;
  municipality_name: string;
  vdcnp_code: string;
  ward_no: string | null;
  address: string;
  household_head_name: string;
  member_name: string;
  relationship: string;
  gender: string;
  client_age: number | null;
  pregnancy_status: string;
  pregnancy_date: string | null;
  mother_of_child: string;
  child_dob: string | null;
}

interface DownloadedAtRow {
  downloaded_at: number | null;
}

function mapRowToCommunityMember(row: CommunityMemberRow): CommunityMember {
  return {
    householdId: row.household_id,
    clientNo: row.client_no,
    districtId: row.district_id,
    districtName: row.district_name,
    municipalityName: row.municipality_name,
    vdcnpCode: row.vdcnp_code,
    wardNo: row.ward_no,
    address: row.address,
    householdHeadName: row.household_head_name,
    memberName: row.member_name,
    relationship: row.relationship,
    gender: row.gender,
    clientAge: row.client_age,
    pregnancyStatus: row.pregnancy_status,
    pregnancyDate: row.pregnancy_date,
    motherOfChild: row.mother_of_child,
    childDob: row.child_dob,
  };
}

function normalizeRequiredValue(value: string, fieldName: string): string {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new Error(`${fieldName} is required`);
  }

  return normalizedValue;
}

export class SQLiteCommunityMemberLocalRepository implements CommunityMemberLocalRepository {
  async replaceDownloadedMembers(
    input: SaveCommunityMembersInput,
  ): Promise<SaveCommunityMembersSummary> {
    const empId = normalizeRequiredValue(input.empId, "Employee ID");
    const downloadedAt = Date.now();

    const uniqueMembers = new Map<string, CommunityMember>();

    for (const member of input.members) {
      const clientNo = member.clientNo.trim();

      if (!clientNo) {
        continue;
      }

      uniqueMembers.set(clientNo, {
        ...member,
        clientNo,
      });
    }

    try {
      await db.execAsync("BEGIN");

      await db.runAsync(
        `
        DELETE FROM community_member_eligibilities
        WHERE emp_id = ?
          AND category_no = ?
          AND member_category = ?
        `,
        [empId, input.categoryNo, input.memberCategory],
      );

      for (const member of uniqueMembers.values()) {
        await db.runAsync(
          `
          INSERT INTO community_members (
            emp_id,
            household_id,
            client_no,
            district_id,
            district_name,
            municipality_name,
            vdcnp_code,
            ward_no,
            address,
            household_head_name,
            member_name,
            relationship,
            gender,
            client_age,
            pregnancy_status,
            pregnancy_date,
            mother_of_child,
            child_dob,
            downloaded_at,
            updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          )
          ON CONFLICT(emp_id, client_no) DO UPDATE SET
            household_id = excluded.household_id,
            district_id = excluded.district_id,
            district_name = excluded.district_name,
            municipality_name = excluded.municipality_name,
            vdcnp_code = excluded.vdcnp_code,
            ward_no = excluded.ward_no,
            address = excluded.address,
            household_head_name = excluded.household_head_name,
            member_name = excluded.member_name,
            relationship = excluded.relationship,
            gender = excluded.gender,
            client_age = excluded.client_age,
            pregnancy_status = excluded.pregnancy_status,
            pregnancy_date = excluded.pregnancy_date,
            mother_of_child = excluded.mother_of_child,
            child_dob = excluded.child_dob,
            downloaded_at = excluded.downloaded_at,
            updated_at = excluded.updated_at
          `,
          [
            empId,
            member.householdId,
            member.clientNo,
            member.districtId,
            member.districtName,
            member.municipalityName,
            member.vdcnpCode,
            member.wardNo,
            member.address,
            member.householdHeadName,
            member.memberName,
            member.relationship,
            member.gender,
            member.clientAge,
            member.pregnancyStatus,
            member.pregnancyDate,
            member.motherOfChild,
            member.childDob,
            downloadedAt,
            downloadedAt,
          ],
        );

        await db.runAsync(
          `
          INSERT INTO community_member_eligibilities (
            emp_id,
            client_no,
            category_no,
            member_category,
            downloaded_at
          ) VALUES (?, ?, ?, ?, ?)
          `,
          [
            empId,
            member.clientNo,
            input.categoryNo,
            input.memberCategory,
            downloadedAt,
          ],
        );
      }

      /*
       * Removing member profiles that no longer belong to any downloaded
       * category for this employee.
       */
      await db.runAsync(
        `
        DELETE FROM community_members
        WHERE emp_id = ?
          AND NOT EXISTS (
            SELECT 1
            FROM community_member_eligibilities eligibility
            WHERE eligibility.emp_id = community_members.emp_id
              AND eligibility.client_no = community_members.client_no
          )
        `,
        [empId],
      );

      await db.execAsync("COMMIT");
    } catch (error) {
      await db.execAsync("ROLLBACK");
      throw error;
    }

    const stored = uniqueMembers.size;

    return {
      received: input.members.length,
      stored,
      skipped: input.members.length - stored,
      downloadedAt,
    };
  }

  async listByFilter(
    filter: CommunityMemberFilter,
  ): Promise<CommunityMember[]> {
    const empId = normalizeRequiredValue(filter.empId, "Employee ID");

    const rows = await db.getAllAsync<CommunityMemberRow>(
      `
      SELECT
        member.household_id,
        member.client_no,
        member.district_id,
        member.district_name,
        member.municipality_name,
        member.vdcnp_code,
        member.ward_no,
        member.address,
        member.household_head_name,
        member.member_name,
        member.relationship,
        member.gender,
        member.client_age,
        member.pregnancy_status,
        member.pregnancy_date,
        member.mother_of_child,
        member.child_dob
      FROM community_members member
      INNER JOIN community_member_eligibilities eligibility
        ON eligibility.emp_id = member.emp_id
       AND eligibility.client_no = member.client_no
      WHERE eligibility.emp_id = ?
        AND eligibility.category_no = ?
        AND eligibility.member_category = ?
      ORDER BY member.member_name COLLATE NOCASE ASC,
               member.client_no ASC
      `,
      [empId, filter.categoryNo, filter.memberCategory],
    );

    return rows.map(mapRowToCommunityMember);
  }

  async getLastDownloadedAt(
    filter: CommunityMemberFilter,
  ): Promise<number | null> {
    const empId = normalizeRequiredValue(filter.empId, "Employee ID");

    const row = await db.getFirstAsync<DownloadedAtRow>(
      `
      SELECT MAX(downloaded_at) AS downloaded_at
      FROM community_member_eligibilities
      WHERE emp_id = ?
        AND category_no = ?
        AND member_category = ?
      `,
      [empId, filter.categoryNo, filter.memberCategory],
    );

    if (row?.downloaded_at === null || row?.downloaded_at === undefined) {
      return null;
    }

    return Number(row.downloaded_at);
  }
}
