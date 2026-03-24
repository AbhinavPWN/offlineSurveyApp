import React, { useCallback, useEffect, useReducer, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  determineEligibleSurveySections,
  // type MemberSurveyProfile,
} from "../engine/surveyClassifier";
import { isSurveySectionKey } from "@/src/features/survey/engine/sectionRegistry";
import {
  createSurveyWizard,
  getCurrentSection,
  goToNextSection,
  goToPreviousSection,
  resumeAtSection,
  type SurveyWizardState,
} from "@/src/features/survey/engine/surveyWizard";
import {
  initialSurveyState,
  loadSurveyDraft,
  surveyReducer,
} from "@/src/features/survey/state/surveyReducer";
import { surveySQLite } from "@/src/services/surveySQLite";
import { getMemberForSurvey } from "../services/getMemberForSurvey";
import { mapMemberToSurveyProfile } from "../mappers/memberToProfile";

interface SurveyScreenProps {
  memberId?: string;
  householdId?: string;
  surveyType?: string;
}

const MOCK_MEMBER_ID = "mock-member-001";
const MOCK_HOUSEHOLD_ID = "mock-household-001";
const DEFAULT_SURVEY_TYPE = "client";

// async function getMemberProfile(
//   memberId: string,
// ): Promise<MemberSurveyProfile> {
//   return {
//     ageYears: 24,
//     ageMonths: null,
//     ageDays: null,
//     gender: "F",
//     maritalStatus: "M",
//     isPregnant: false,
//     isPostpartum: false,
//     hasNeonateInCare: false,
//     hasInfantInCare: false,
//   };
// }

export default function SurveyScreen({
  memberId = MOCK_MEMBER_ID,
  householdId = MOCK_HOUSEHOLD_ID,
  surveyType = DEFAULT_SURVEY_TYPE,
}: SurveyScreenProps) {
  const [surveyId, setSurveyId] = useState<string | null>(null);
  const [wizardState, setWizardState] = useState<SurveyWizardState | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasEligibleSections, setHasEligibleSections] = useState(true);

  const [, dispatch] = useReducer(surveyReducer, initialSurveyState);

  const persistCurrentSection = useCallback(
    async (nextWizardState: SurveyWizardState | null) => {
      if (!surveyId || !nextWizardState) return;

      const currentSection = getCurrentSection(nextWizardState);

      try {
        await surveySQLite.updateSurveyCurrentSection(surveyId, currentSection);
      } catch (persistError) {
        setError(
          persistError instanceof Error
            ? persistError.message
            : "Failed to save survey progress.",
        );
      }
    },
    [surveyId],
  );

  useEffect(() => {
    let isActive = true;

    async function initializeSurvey() {
      setLoading(true);
      setError(null);
      setHasEligibleSections(true);
      setSurveyId(null);
      setWizardState(null);

      try {
        // Load member data and map to survey profile from local db
        const member = await getMemberForSurvey(memberId);

        if (!isActive) return;

        // step 2 : Map -> Survey profile
        const profile = mapMemberToSurveyProfile(member);

        // step 3: Determine eligible sections based on profile
        const eligibleSections = determineEligibleSurveySections(profile);

        if (eligibleSections.length === 0) {
          setHasEligibleSections(false);
          dispatch(loadSurveyDraft({}));
          return;
        }

        // 4. Create or load survey draft in SQLite
        const survey = await surveySQLite.createSurveyDraft(
          memberId,
          householdId,
          surveyType,
        );

        if (!isActive) return;

        setSurveyId(survey.surveyId);

        // 5. Load existing answers if any and initialize wizard state
        const answers = await surveySQLite.loadSurveyAnswers(survey.surveyId);

        if (!isActive) return;

        dispatch(loadSurveyDraft(answers));

        // 6. initialize wizard with eligible sections and resume at last section if applicable
        let nextWizardState = createSurveyWizard(eligibleSections);

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
        await surveySQLite.updateSurveyCurrentSection(
          survey.surveyId,
          currentSection,
        );
      } catch (initError) {
        if (!isActive) return;

        setError(
          initError instanceof Error
            ? initError.message
            : "Failed to initialize survey.",
        );
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void initializeSurvey();

    return () => {
      isActive = false;
    };
  }, [householdId, memberId, surveyType]);

  const handleNext = useCallback(() => {
    setWizardState((previousState) => {
      if (!previousState) return previousState;

      const nextState = goToNextSection(previousState);
      void persistCurrentSection(nextState);
      return nextState;
    });
  }, [persistCurrentSection]);

  const handlePrevious = useCallback(() => {
    setWizardState((previousState) => {
      if (!previousState) return previousState;

      const nextState = goToPreviousSection(previousState);
      void persistCurrentSection(nextState);
      return nextState;
    });
  }, [persistCurrentSection]);

  const currentSection = wizardState ? getCurrentSection(wizardState) : null;
  const currentIndex = wizardState?.currentIndex ?? 0;
  const totalSections = wizardState?.sections.length ?? 0;
  const isFirstSection = currentIndex === 0;
  const isLastSection =
    !wizardState || totalSections === 0 || currentIndex === totalSections - 1;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
        <Text className="mt-3 text-gray-500">Initializing survey...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-red-600">{error}</Text>
      </View>
    );
  }

  if (!hasEligibleSections) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-gray-700">
          No eligible survey sections were found for this member.
        </Text>
      </View>
    );
  }

  if (!wizardState || !currentSection) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-gray-700">
          Survey wizard is not ready.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-white">
      <View className="flex-1 px-4 py-6">
        <Text className="text-sm text-gray-500">
          Survey ID: {surveyId ?? "Pending"}
        </Text>

        <Text className="mt-2 text-sm text-gray-500">
          Progress {currentIndex + 1} of {totalSections}
        </Text>

        <View className="mt-6 rounded-lg border border-gray-200 p-4">
          <Text className="text-sm text-gray-500">Current section</Text>
          <Text className="mt-2 text-xl font-semibold">{currentSection}</Text>
        </View>
      </View>

      <View className="flex-row border-t border-gray-200 px-4 py-3">
        <Pressable
          onPress={handlePrevious}
          disabled={isFirstSection}
          className={`mr-2 flex-1 rounded-lg py-3 ${
            isFirstSection ? "bg-gray-200" : "bg-gray-300"
          }`}
        >
          <Text className="text-center">Previous</Text>
        </Pressable>

        <Pressable
          onPress={handleNext}
          disabled={isLastSection}
          className={`ml-2 flex-1 rounded-lg py-3 ${
            isLastSection ? "bg-blue-300" : "bg-blue-600"
          }`}
        >
          <Text className="text-center text-white">Next</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
