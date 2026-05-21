// src\features\survey\hooks\useSurveyInitialization.ts
import { useEffect, useState } from "react";
import { getMemberForSurvey } from "../services/getMemberForSurvey";
import { mapMemberToSurveyProfile } from "../mappers/memberToProfile";
import { determineSurveyClassification } from "../engine/surveyClassifier";
import { surveySQLite } from "@/src/services/surveySQLite";
import { loadSurveyDraft, SurveyAnswers } from "../state/surveyReducer";
import {
  createSurveyWizard,
  getCurrentSection,
  resumeAtSection,
} from "../engine/surveyWizard";
import { isSurveySectionKey } from "../engine/sectionRegistry";
import type { SurveyWizardState } from "../engine/surveyWizard";
import type { MemberSurveyProfile } from "../engine/surveyClassifier";
import { householdLocalRepository } from "@/src/di/container";
import { deriveSurveySections } from "../engine/deriveSurveySections";

type UseSurveyInitializationReturn = {
  loading: boolean;
  error: string | null;
  wizardState: SurveyWizardState | null;
  surveyId: string | null;
  memberState: Record<string, any> | null;
  profileState: MemberSurveyProfile | null;
  hasEligibleSections: boolean;
  setWizardState: React.Dispatch<
    React.SetStateAction<SurveyWizardState | null>
  >;
};

export function useSurveyInitialization({
  memberId,
  householdId,
  surveyType,
  dispatch,
}: {
  memberId: string | null;
  householdId: string | null;
  surveyType: string;
  dispatch: React.Dispatch<any>;
}): UseSurveyInitializationReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surveyId, setSurveyId] = useState<string | null>(null);
  const [wizardState, setWizardState] = useState<SurveyWizardState | null>(
    null,
  );
  const [memberState, setMemberState] = useState<Record<string, any> | null>(
    null,
  );
  const [profileState, setProfileState] = useState<MemberSurveyProfile | null>(
    null,
  );
  const [hasEligibleSections, setHasEligibleSections] = useState(true);

  // Initialization logic
  useEffect(() => {
    if (!memberId || !householdId) return;

    const safeMemberId = memberId;
    // const safeHouseholdId = householdId;

    let isActive = true;

    async function initializeSurvey() {
      setLoading(true);
      setError(null);
      setHasEligibleSections(true);

      // setSurveyId(null);
      // setWizardState(null);

      try {
        // Load member data and map to survey profile from local db
        const member = await getMemberForSurvey(safeMemberId);

        const household = await householdLocalRepository.getByLocalId(
          member.householdLocalId,
        );

        if (!household) {
          throw new Error("Household not found");
        }
        setMemberState(member);

        if (!member) {
          throw new Error("Member not found");
        }

        if (!isActive) return;

        // step 2 : Map -> Survey profile
        const profile = mapMemberToSurveyProfile({
          client_age: member.clientAge,
          dob: member.dobAD,
          gender: member.gender,
          maritaL_STATUS: member.maritalStatus,
          pregnancY_STATUS: member.pregnancyStatus,
          motherofChild: member.motherofChild,
          childDob: member.childDobAD,
          disabilityStatus: member.disabilityStatus,
        });

        setProfileState(profile);

        // step 3: Determine eligible sections based on profile
        const classification = determineSurveyClassification(profile);

        console.log("[SURVEY_PROFILE]", profile);
        console.log("[SURVEY_CLASSIFICATION]", classification);

        // 4. Create or load survey draft in SQLite
        if (!member.clientNo) throw new Error("Missing clientNo");
        if (!household.householdId) throw new Error("Missing householdId");

        const survey = await surveySQLite.createSurveyDraft(
          member.clientNo, //  correct API ID
          household.householdId, //  correct API ID
          surveyType,
        );

        if (!isActive) return;

        setSurveyId(survey.surveyId);

        // handle empty survey case
        // if (!primary) {
        //   setHasEligibleSections(false);
        //   dispatch(loadSurveyDraft({}));
        //   return;
        // }

        // 5. Load existing answers if any and initialize wizard state
        // const answers = await surveySQLite.loadSurveyAnswers(survey.surveyId);
        const rawAnswers = await surveySQLite.loadSurveyAnswers(
          survey.surveyId,
        );

        const cleanedAnswers: SurveyAnswers = {};

        for (const key in rawAnswers) {
          const value = rawAnswers[key];

          // 🔥 FIX: detect corrupted array
          if (Array.isArray(value)) {
            // check if it's character array corruption
            if (
              value.length > 0 &&
              value.every((v) => typeof v === "string" && v.length === 1)
            ) {
              try {
                const joined = value.join("");
                const parsed = JSON.parse(joined);

                cleanedAnswers[key] = Array.isArray(parsed) ? parsed : null;
              } catch {
                cleanedAnswers[key] = null;
              }
            } else {
              cleanedAnswers[key] = value;
            }
          } else {
            cleanedAnswers[key] = value;
          }
        }
        if (!isActive) return;

        dispatch(loadSurveyDraft(cleanedAnswers));

        // 6. initialize wizard with eligible sections and resume at last section if applicable
        // 6. derive final sections
        const sections = deriveSurveySections(profile, cleanedAnswers);

        // handle empty survey case
        if (sections.length === 0) {
          setHasEligibleSections(false);
          return;
        }

        let nextWizardState = createSurveyWizard(sections);

        // 7. Resume logic
        if (
          survey.currentSection &&
          isSurveySectionKey(survey.currentSection)
        ) {
          nextWizardState = resumeAtSection(
            nextWizardState,
            survey.currentSection,
          );
        }

        setWizardState(nextWizardState);

        // 8 . persist current section to ensure survey record is up to date
        const currentSection = getCurrentSection(nextWizardState);

        if (isActive && currentSection) {
          await surveySQLite.updateSurveyCurrentSection(
            survey.surveyId,
            currentSection,
          );
        }
      } catch (err) {
        if (!isActive) return;

        console.error("Survey init error:", err);

        setError(
          err instanceof Error ? err.message : "Failed to initialize survey",
        );
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void initializeSurvey();

    return () => {
      isActive = false;
    };
  }, [dispatch, householdId, memberId, surveyType]);

  return {
    loading,
    error,
    wizardState,
    surveyId,
    memberState,
    profileState,
    hasEligibleSections,
    setWizardState, // needed later
  };
}
