// src/usecases/sync/surveySyncService.ts

import { surveySQLite } from "@/src/services/surveySQLite";
import { detectSectionsFromAnswers } from "@/src/features/survey/utils/surveySyncUtils";
import { buildSurveyPayload } from "@/src/features/survey/mappers/buildSurveyPayload";
import { emptySurveyPayload } from "@/src/features/survey/mappers/emptySurveyPayload";

import { BaseApiClient } from "@/src/services/api/BaseApiClient";
import { householdMemberLocalRepository } from "@/src/di/container";

import { validateSurveyPayload } from "./validators/payloadValidator";
import { analyzeSurveyPayload } from "./validators/payloadAnalyzer";
import { logPayloadDebug } from "./utils/payloadLogger";

import { AppLogger } from "@/src/utils/AppLogger";

// ---------- Utils ----------
function ensureApiDateFormat(dateStr: string | null): string {
  if (!dateStr) return "";

  if (/^\d{2}-[A-Z]{3}-\d{4}$/.test(dateStr)) {
    return dateStr;
  }

  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
}

// ---------- Clean conditional "Others" ----------
function cleanConditionalOthers(payload: Record<string, any>) {
  const result = { ...payload };

  if (result.neonateQ8 === "N") {
    result.neonateQ9 = "";
    result.neonateQ9Others = "";
  }
  if (result.neonateQ9 !== "6") {
    result.neonateQ9Others = "";
  }

  if (result.postpartumWoQ5 === "N") {
    result.postpartumWoQ6 = "";
    result.postpartumWoQ6Others = "";
  }
  if (result.postpartumWoQ6 !== "O") {
    result.postpartumWoQ6Others = "";
  }

  if (result.postpartumWoQ10 === "N") {
    result.postpartumWoQ11 = "";
    result.postpartumWoQ11Others = "";
  }
  if (result.postpartumWoQ11 !== "O") {
    result.postpartumWoQ11Others = "";
  }

  return result;
}

// ---------- Main Sync ----------
export async function syncPendingSurveys(userId: string) {
  const pending = await surveySQLite.getPendingSurveysForSync();

  await AppLogger.log("SYNC", "[SURVEY][START]", {
    totalPending: pending.length,
  });

  console.log("[SYNC][START]", {
    totalPending: pending.length,
  });

  const api = BaseApiClient.getInstance();

  let successCount = 0;
  let failCount = 0;

  for (const item of pending) {
    const { survey, answers } = item;

    await AppLogger.log("SYNC", "[SURVEY][PROCESSING]", {
      surveyId: survey.surveyId,
    });

    const member = await householdMemberLocalRepository.getByClientNo(
      survey.memberId,
    );

    if (!member) {
      await AppLogger.log("ERROR", "[SURVEY][MEMBER_NOT_FOUND]", {
        surveyId: survey.surveyId,
        memberId: survey.memberId,
      });

      console.error("[SYNC][ERROR] Member not found", {
        surveyId: survey.surveyId,
        memberId: survey.memberId,
      });

      failCount++;
      continue;
    }

    console.log("[SYNC][SURVEY_START]", {
      surveyId: survey.surveyId,
      rawDate: survey.surveyDate,
    });

    try {
      // ---------- Detect Sections ----------
      const sections = detectSectionsFromAnswers(answers);

      console.log("[SYNC][ACTIVE_SECTIONS]", sections);

      // ---------- Build FULL Payload ----------
      let payload: Record<string, any> = {
        ...emptySurveyPayload,
        ...buildSurveyPayload(answers, sections),
      };

      // ---------- Clean conditional fields ----------
      payload = cleanConditionalOthers(payload);

      // ---------- Add Required Root Fields ----------
      payload = {
        ...payload,
        householdId: survey.householdId,
        clientNo: survey.memberId,
        clientAge: member.clientAge ? String(member.clientAge) : "0",
        surveyDate: ensureApiDateFormat(survey.surveyDate),
        userId: userId.toUpperCase(),
        insertUpdate: "I",
      };

      // ---------- DEBUG ----------
      console.log("[SYNC][PAYLOAD_META]", {
        surveyId: survey.surveyId,
        sections,
        totalKeys: Object.keys(payload).length,
      });

      console.log("[SYNC][IDENTIFIERS]", {
        householdId: survey.householdId,
        memberId: survey.memberId,
      });

      const analysis = analyzeSurveyPayload(payload);
      console.log("[PAYLOAD][ANALYSIS]", analysis);

      const validationErrors = validateSurveyPayload(payload);

      if (validationErrors.length > 0) {
        await AppLogger.log("WARN", "[SURVEY][VALIDATION_ERRORS]", {
          surveyId: survey.surveyId,
          errors: validationErrors,
        });

        console.warn("[PAYLOAD][VALIDATION_ERRORS]", {
          surveyId: survey.surveyId,
          errors: validationErrors,
        });
      } else {
        console.log("[PAYLOAD][VALIDATION_OK]", {
          surveyId: survey.surveyId,
        });
      }

      logPayloadDebug(payload);

      console.log("[SYNC][FINAL_PAYLOAD]", JSON.stringify(payload, null, 2));

      await AppLogger.log("SYNC_DEBUG", "[SURVEY][PAYLOAD_READY]", {
        surveyId: survey.surveyId,
      });

      // ---------- API CALL ----------
      const response = await api.post(
        "/Household_Member_Survey_Entry",
        payload,
      );

      console.log("[SYNC][API_SUCCESS]", {
        surveyId: survey.surveyId,
        status: response.status,
        data: response.data,
      });

      await surveySQLite.markSurveySynced(survey.surveyId);

      await AppLogger.log("SYNC", "[SURVEY][SUCCESS]", {
        surveyId: survey.surveyId,
      });

      successCount++;
    } catch (error: any) {
      failCount++;

      await AppLogger.log("ERROR", "[SURVEY][FAIL]", {
        surveyId: survey.surveyId,
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });

      console.error("[SYNC][FAILED]", {
        surveyId: survey.surveyId,
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
    }
  }

  await AppLogger.log("SYNC", "[SURVEY][END]", {
    total: pending.length,
    success: successCount,
    failed: failCount,
  });

  console.log("[SYNC][SUMMARY]", {
    total: pending.length,
    success: successCount,
    failed: failCount,
  });
}
