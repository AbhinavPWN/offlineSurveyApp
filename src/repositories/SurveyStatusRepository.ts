import { db } from "@/src/db";

export interface HouseholdSurveySummary {
  householdId: string;
  ready: number;
  inProgress: number;
  synced: number;
  review: number;
}
export interface PendingSurveyDisplay {
  surveyId: string;
  householdId: string;
  householdLocalId: string;
  memberName: string;
  review: number;
}

export class SurveyStatusRepository {
  async summaries(username: string): Promise<HouseholdSurveySummary[]> {
    return db.getAllAsync<HouseholdSurveySummary>(
      `
      SELECT h.server_id AS householdId,
        SUM(CASE WHEN s.synced=0 AND s.status='completed' AND a.survey_id IS NULL THEN 1 ELSE 0 END) AS ready,
        SUM(CASE WHEN s.synced=0 AND s.status='draft' AND a.survey_id IS NULL THEN 1 ELSE 0 END) AS inProgress,
        SUM(CASE WHEN s.synced=1 THEN 1 ELSE 0 END) AS synced,
        SUM(CASE WHEN s.synced=0 AND a.survey_id IS NOT NULL THEN 1 ELSE 0 END) AS review
      FROM households h JOIN surveys s ON s.household_id=h.server_id
      LEFT JOIN survey_submission_attempts a ON a.survey_id=s.survey_id
      WHERE h.chw_id=? GROUP BY h.server_id`,
      [username],
    );
  }

  async pending(username: string): Promise<PendingSurveyDisplay[]> {
    return db.getAllAsync<PendingSurveyDisplay>(
      `
      SELECT s.survey_id AS surveyId, h.server_id AS householdId,
        h.id AS householdLocalId,
        COALESCE(NULLIF(TRIM(COALESCE(m.first_name,'') || ' ' || COALESCE(m.middle_name,'') || ' ' || COALESCE(m.last_name,'')),''), s.member_id) AS memberName,
        CASE WHEN a.survey_id IS NOT NULL THEN 1 ELSE 0 END AS review
      FROM surveys s JOIN households h ON h.server_id=s.household_id
      LEFT JOIN household_members m ON m.client_no=s.member_id AND m.household_local_id=h.id
      LEFT JOIN survey_submission_attempts a ON a.survey_id=s.survey_id
      WHERE h.chw_id=? AND s.synced=0 AND s.status='completed'
      ORDER BY s.updated_at`,
      [username],
    );
  }
}
