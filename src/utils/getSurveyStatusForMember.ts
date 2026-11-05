import { surveySQLite } from "@/src/services/surveySQLite";
import { SurveySubmissionAttemptRepository } from "@/src/repositories/SurveySubmissionAttemptRepository";

const submissionAttempts = new SurveySubmissionAttemptRepository();

export type SurveyMemberDisplayStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "READY_TO_SYNC"
  | "REVIEW_REQUIRED"
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
    if (survey.synced === 0 && await submissionAttempts.requiresReview(survey.surveyId)) {
      return "REVIEW_REQUIRED";
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
