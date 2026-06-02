// src/usecases/sync/surveySyncService.ts

import { surveySQLite } from "@/src/services/surveySQLite";
import { buildSurveyPayload } from "@/src/features/survey/mappers/buildSurveyPayload";
import { emptySurveyPayload } from "@/src/features/survey/mappers/emptySurveyPayload";

import { BaseApiClient } from "@/src/services/api/BaseApiClient";
import { householdMemberLocalRepository } from "@/src/di/container";

import { validateSurveyPayload } from "./validators/payloadValidator";
import { analyzeSurveyPayload } from "./validators/payloadAnalyzer";
import { logPayloadDebug } from "./utils/payloadLogger";

import { AppLogger } from "@/src/utils/AppLogger";
import { deriveSurveySections } from "@/src/features/survey/engine/deriveSurveySections";
import { mapMemberToSurveyProfile } from "@/src/features/survey/mappers/memberToProfile";

import {
  SyncEntitySummary,
  createEmptySyncSummary,
  getSafeSyncReason,
} from "./SyncSummary";

// ---------- Utils ----------
function ensureApiDateFormat(dateStr: string | null): string {
  if (!dateStr) return "";

  if (/^\d{2}-[A-Z]{3}-\d{4}$/.test(dateStr)) {
    return dateStr;
  }

  const d = new Date(dateStr);

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
}

function getMemberDisplayName(member: any): string {
  const name = [member.firstName, member.middleName, member.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || member.clientNo || "Survey";
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

  // ---------- SOCIAL PROTECTION WOMEN ----------
  if (result.adultFQ2Ans10 !== "Y") {
    result.adultFQ2Others = "";
  }

  return result;
}

// ---------- Main Sync ----------
export async function syncPendingSurveys(
  userId: string,
): Promise<SyncEntitySummary> {
  const pending = await surveySQLite.getPendingSurveysForSync();

  const summary = createEmptySyncSummary();
  summary.total = pending.length;

  await AppLogger.log("SYNC", "[SURVEY][START]", {
    totalPending: pending.length,
    userId,
  });

  if (__DEV__) {
    console.log("[SYNC][SURVEY][START]", {
      totalPending: pending.length,
    });
  }

  const api = BaseApiClient.getInstance();

  let successCount = 0;
  let failCount = 0;

  for (const item of pending) {
    const { survey, answers } = item;

    await AppLogger.log("SYNC", "[SURVEY][PROCESSING]", {
      surveyId: survey.surveyId,
      memberId: survey.memberId,
      householdId: survey.householdId,
      surveyDate: survey.surveyDate,
    });

    if (__DEV__) {
      console.log("[SYNC][SURVEY][PROCESSING]", {
        surveyId: survey.surveyId,
        memberId: survey.memberId,
        householdId: survey.householdId,
        rawDate: survey.surveyDate,
      });
    }

    const member = await householdMemberLocalRepository.getByClientNo(
      survey.memberId,
    );

    if (!member) {
      const reason = "Member record not found for this survey.";

      await AppLogger.log("ERROR", "[SURVEY][MEMBER_NOT_FOUND]", {
        surveyId: survey.surveyId,
        memberId: survey.memberId,
        householdId: survey.householdId,
        reason,
      });

      if (__DEV__) {
        console.error("[SYNC][SURVEY][MEMBER_NOT_FOUND]", {
          surveyId: survey.surveyId,
          memberId: survey.memberId,
          householdId: survey.householdId,
        });
      }

      failCount++;
      summary.failed += 1;
      summary.items.push({
        id: survey.surveyId,
        label: `Survey ${survey.surveyId}`,
        status: "FAILED",
        reason,
      });

      continue;
    }

    const memberLabel = getMemberDisplayName(member);

    await AppLogger.log("SYNC", "[SURVEY][MEMBER_FOUND]", {
      surveyId: survey.surveyId,
      memberId: survey.memberId,
      memberLocalId: member.localId,
      clientNo: member.clientNo,
    });

    const profile = mapMemberToSurveyProfile({
      client_age: member.clientAge,
      dob: member.dobAD,
      gender: member.gender,
      maritaL_STATUS: member.maritalStatus,
      pregnancY_STATUS: member.pregnancyStatus,
      motherofChild: member.motherofChild,
      childDob: member.childDobAD,
      disabilityStatus: member.disabilityStatus,
      // disabilitY_STATUS: member.disabilitY_STATUS,
    });

    try {
      if (__DEV__) {
        console.log("[SYNC][SURVEY][PROFILE]", {
          surveyId: survey.surveyId,
          profile,
        });
      }

      // ---------- Detect Sections ----------
      const sections = deriveSurveySections(profile, answers);

      await AppLogger.log("SYNC", "[SURVEY][SECTIONS_DERIVED]", {
        surveyId: survey.surveyId,
        sections,
      });

      if (__DEV__) {
        console.log("[SYNC][SURVEY][DERIVED_SECTIONS]", {
          surveyId: survey.surveyId,
          sections,
        });
      }

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

      const payloadMeta = {
        surveyId: survey.surveyId,
        householdId: survey.householdId,
        clientNo: survey.memberId,
        sections,
        totalKeys: Object.keys(payload).length,
      };

      await AppLogger.log("SYNC_DEBUG", "[SURVEY][PAYLOAD_READY]", payloadMeta);

      if (__DEV__) {
        console.log("[SYNC][SURVEY][PAYLOAD_META]", payloadMeta);
        console.log("[SYNC][SURVEY][IDENTIFIERS]", {
          householdId: survey.householdId,
          memberId: survey.memberId,
        });
      }

      const analysis = analyzeSurveyPayload(payload);

      if (__DEV__) {
        console.log("[PAYLOAD][ANALYSIS]", {
          surveyId: survey.surveyId,
          analysis,
        });
      }

      const validationErrors = validateSurveyPayload(payload);

      if (validationErrors.length > 0) {
        await AppLogger.log("WARN", "[SURVEY][VALIDATION_ERRORS]", {
          surveyId: survey.surveyId,
          householdId: survey.householdId,
          memberId: survey.memberId,
          errorCount: validationErrors.length,
          errors: validationErrors,
        });

        if (__DEV__) {
          console.warn("[PAYLOAD][VALIDATION_ERRORS]", {
            surveyId: survey.surveyId,
            errors: validationErrors,
          });
        }
      } else {
        await AppLogger.log("SYNC", "[SURVEY][VALIDATION_OK]", {
          surveyId: survey.surveyId,
          totalKeys: Object.keys(payload).length,
        });

        if (__DEV__) {
          console.log("[PAYLOAD][VALIDATION_OK]", {
            surveyId: survey.surveyId,
          });
        }
      }

      if (__DEV__) {
        logPayloadDebug(payload);
        console.log(
          "[SYNC][SURVEY][FINAL_PAYLOAD]",
          JSON.stringify(payload, null, 2),
        );
      }

      // ---------- API CALL ----------
      await AppLogger.log("SYNC", "[SURVEY][API_REQUEST]", {
        surveyId: survey.surveyId,
        endpoint: "/Household_Member_Survey_Entry",
        householdId: survey.householdId,
        clientNo: survey.memberId,
      });

      const response = await api.post(
        "/Household_Member_Survey_Entry",
        payload,
      );

      await AppLogger.log("SYNC", "[SURVEY][API_SUCCESS]", {
        surveyId: survey.surveyId,
        status: response.status,
      });

      if (__DEV__) {
        console.log("[SYNC][SURVEY][API_SUCCESS]", {
          surveyId: survey.surveyId,
          status: response.status,
          data: response.data,
        });
      }

      await surveySQLite.markSurveySynced(survey.surveyId);

      await AppLogger.log("SYNC", "[SURVEY][MARKED_SYNCED]", {
        surveyId: survey.surveyId,
      });

      successCount++;
      summary.success += 1;
      summary.items.push({
        id: survey.surveyId,
        label: memberLabel,
        status: "SUCCESS",
      });
    } catch (error: any) {
      failCount++;

      const reason = getSafeSyncReason(error);

      await AppLogger.log("ERROR", "[SURVEY][FAIL]", {
        surveyId: survey.surveyId,
        memberId: survey.memberId,
        householdId: survey.householdId,
        message: error?.message,
        status: error?.response?.status,
        reason,
      });

      if (__DEV__) {
        console.error("[SYNC][SURVEY][FAILED]", {
          surveyId: survey.surveyId,
          memberId: survey.memberId,
          householdId: survey.householdId,
          message: error?.message,
          status: error?.response?.status,
          data: error?.response?.data,
          reason,
        });
      }

      summary.failed += 1;
      summary.items.push({
        id: survey.surveyId,
        label: memberLabel,
        status: "FAILED",
        reason,
      });
    }
  }

  await AppLogger.log("SYNC", "[SURVEY][END]", {
    total: pending.length,
    success: successCount,
    failed: failCount,
    summary,
  });

  if (__DEV__) {
    console.log("[SYNC][SURVEY][SUMMARY]", {
      total: pending.length,
      success: successCount,
      failed: failCount,
      summary,
    });
  }

  return summary;
}
