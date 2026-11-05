import { db } from "@/src/db";

export class SurveySubmissionAttemptRepository {
  async requiresReview(surveyId: string): Promise<boolean> {
    return !!(await db.getFirstAsync(
      "SELECT survey_id FROM survey_submission_attempts WHERE survey_id=?",
      [surveyId],
    ));
  }

  async begin(surveyId: string): Promise<void> {
    await db.runAsync(
      "INSERT INTO survey_submission_attempts(survey_id, attempted_at) VALUES (?, ?)",
      [surveyId, new Date().toISOString()],
    );
  }

  async clear(surveyId: string): Promise<void> {
    await db.runAsync(
      "DELETE FROM survey_submission_attempts WHERE survey_id=?",
      [surveyId],
    );
  }
}
