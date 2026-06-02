import { surveySQLite } from "@/src/services/surveySQLite";

export type SurveyMemberDisplayStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "READY_TO_SYNC"
  | "SYNCED";

export async function getSurveyStatusForMember(
  memberId?: string,
): Promise<SurveyMemberDisplayStatus> {
  if (!memberId) {
    return "NOT_STARTED";
  }

  try {
    const survey = await surveySQLite.getSurveyByMemberId(memberId);

    // No survey exists
    if (!survey) {
      return "NOT_STARTED";
    }

    // Draft survey
    if (survey.status === "draft") {
      return "IN_PROGRESS";
    }

    // Completed but waiting sync
    if (survey.status === "completed" && survey.synced === 0) {
      return "READY_TO_SYNC";
    }

    // Completed + synced
    if (survey.status === "completed" && survey.synced === 1) {
      return "SYNCED";
    }

    return "NOT_STARTED";
  } catch (error) {
    console.log("[SURVEY_MEMBER_STATUS_ERROR]", error);

    return "NOT_STARTED";
  }
}
