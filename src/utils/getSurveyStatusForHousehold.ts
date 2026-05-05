import { db } from "@/src/db";

export type SurveyAggregateStatus = "NONE" | "DRAFT" | "PENDING" | "SYNCED";

export async function getSurveyStatusForHousehold(
  householdId?: string,
): Promise<SurveyAggregateStatus> {
  //  Safety guard
  if (!householdId) return "NONE";

  try {
    const rows = await db.getAllAsync<any>(
      `
      SELECT status, synced
      FROM surveys
      WHERE household_id = ?
      `,
      [householdId],
    );

    if (!rows || rows.length === 0) {
      return "NONE";
    }

    let hasDraft = false;
    let hasPending = false;

    for (const row of rows) {
      if (row.status === "draft") {
        hasDraft = true;
      }

      if (row.status === "completed" && row.synced === 0) {
        hasPending = true;
      }
    }

    if (hasPending) return "PENDING";
    if (hasDraft) return "DRAFT";

    return "SYNCED";
  } catch (error) {
    // 🔒 Never break dashboard if query fails
    console.log("[SURVEY_STATUS_ERROR]", error);
    return "NONE";
  }
}
