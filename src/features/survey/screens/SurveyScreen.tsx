// src\features\survey\screens\SurveyScreen.tsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SurveySectionKey } from "../engine/surveyClassifier";
// import { isSurveySectionKey } from "@/src/features/survey/engine/sectionRegistry";
import {
  // createSurveyWizard,
  getCurrentSection,
  goToNextSection,
  goToPreviousSection,
  // resumeAtSection,
  SurveyWizardState,
} from "@/src/features/survey/engine/surveyWizard";
import {
  initialSurveyState,
  // loadSurveyDraft,
  surveyReducer,
  // SurveyAnswers,
} from "@/src/features/survey/state/surveyReducer";
import { surveySQLite } from "@/src/services/surveySQLite";
// import { getMemberForSurvey } from "../services/getMemberForSurvey";
// import { mapMemberToSurveyProfile } from "../mappers/memberToProfile";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FEATURES } from "@/src/config/features";
import { SECTION_CONFIG } from "../config/sectionConfig";
import { SECTION_QUESTIONS } from "../config/SectionQuestions";
import { SurveySectionRenderer } from "../sections/SurveySectionRenderer";
// import { QuestionConfig } from "../components/QuestionRenderer";
import {
  // enqueueAnswerWrite,
  flushQueue,
  processQueue,
} from "../services/surveyWriteQueue";
import { useSurveyInitialization } from "../hooks/useSurveyInitialization";
import { useAnswerHandler } from "../hooks/useAnswerHandler";
import { validateSection, isSectionComplete } from "../hooks/surveyValidation";
import { calculateSurveyProgress } from "../hooks/useSurveyProgress";

import { detectSectionsFromAnswers } from "../utils/surveySyncUtils";
import { buildSurveyPayload } from "../mappers/buildSurveyPayload";

// Creating a param normalizer function '
function getSafeParam(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

// const clearStatusTimers = new Map<string, ReturnType<typeof setTimeout>>();

export default function SurveyScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const memberId = getSafeParam(params.memberId);
  const householdId = getSafeParam(params.householdId);
  const surveyType = getSafeParam(params.surveyType) ?? "client";
  const [state, dispatch] = useReducer(surveyReducer, initialSurveyState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [savingStatus, setSavingStatus] = useState<
    Record<string, "saving" | "saved" | "error">
  >({});
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false);

  useEffect(() => {
    console.log("[SavingStatus UPDATED]", savingStatus);
  }, [savingStatus]);

  useEffect(() => {
    console.log("[Queue][RECOVERY_TRIGGER]");
    processQueue();
  }, []);

  const {
    loading,
    error,
    wizardState,
    surveyId,
    memberState,
    profileState,
    hasEligibleSections,
    setWizardState,
  } = useSurveyInitialization({
    memberId,
    householdId,
    surveyType,
    dispatch,
  });

  const handleAnswer = useAnswerHandler({
    surveyId,
    dispatch,
    setSavingStatus,
    setErrors,
  });

  // Persist section
  const persistCurrentSection = useCallback(
    async (nextWizardState: SurveyWizardState | null) => {
      if (!surveyId || !nextWizardState) return;

      const currentSection = getCurrentSection(nextWizardState);
      if (!currentSection) return;

      try {
        await surveySQLite.updateSurveyCurrentSection(surveyId, currentSection);
      } catch (persistError) {
        console.error(
          "[Persist Section Error]",
          persistError instanceof Error ? persistError.message : persistError,
        );
      }
    },
    [surveyId],
  );

  /* ---------- DERIVED STATE ---------- */
  const currentSection = wizardState ? getCurrentSection(wizardState) : null;

  const currentIndex = wizardState?.currentIndex ?? 0;
  const totalSections = wizardState?.sections.length ?? 0;

  const isFirstSection = currentIndex === 0;
  const isLastSection =
    totalSections === 0 || currentIndex === totalSections - 1;

  const hasPendingSaves = Object.values(savingStatus).some(
    (status) => status === "saving",
  );

  const activeSections = useMemo<SurveySectionKey[]>(() => {
    if (!currentSection) return [];
    return [currentSection];
  }, [currentSection]);

  // temporary reset button :

  // const handleReset = async () => {
  //   await surveySQLite.deleteAllUnsyncedSurveys();
  // };

  // handlers for navigation
  const handleNext = useCallback(async () => {
    if (!wizardState || !currentSection) return;
    console.log("Next button is being clicked");

    let validationErrors: Record<string, string> = {};
    setHasAttemptedNext(true);

    for (const section of activeSections) {
      const sectionQuestions = SECTION_QUESTIONS[section];
      const sectionErrors = validateSection(sectionQuestions, state.answers);

      validationErrors = { ...validationErrors, ...sectionErrors };
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors({ ...validationErrors }); // always new reference
      return; //  STOP navigation
    }

    // Waiting for all saves
    await flushQueue();
    console.log("[VALIDATION ERRORS]", validationErrors);
    setErrors({}); // clear errors

    setWizardState((previousState: SurveyWizardState | null) => {
      if (!previousState) return previousState;

      const nextState = goToNextSection(previousState);
      void persistCurrentSection(nextState);
      return nextState;
    });
  }, [
    wizardState,
    currentSection,
    setWizardState,
    activeSections,
    state.answers,
    persistCurrentSection,
  ]);

  const handlePrevious = useCallback(() => {
    setWizardState((previousState) => {
      if (!previousState) return previousState;

      const nextState = goToPreviousSection(previousState);
      void persistCurrentSection(nextState);
      return nextState;
    });

    // background flush (safe)
    flushQueue().catch((err) => {
      console.warn("[Queue Flush Error]", err);
    });
  }, [persistCurrentSection, setWizardState]);

  // Finish button handler
  const handleFinish = useCallback(async () => {
    if (!wizardState || !currentSection || !surveyId) return;

    setErrors({}); // clear previous errors

    const sectionQuestions = SECTION_QUESTIONS[currentSection];
    const validationErrors = validateSection(sectionQuestions, state.answers);

    if (Object.keys(validationErrors).length > 0) {
      setErrors({ ...validationErrors });
      return;
    }

    try {
      await flushQueue();
      // Temporary testing
      const pending = await surveySQLite.getPendingSurveysForSync();

      for (const item of pending) {
        const { answers } = item;

        const sections = detectSectionsFromAnswers(answers);

        console.log("[DETECTED SECTIONS]", sections);

        const payload = buildSurveyPayload(answers, sections);

        console.log("[FINAL PAYLOAD]", payload);
      }
      // Temporary testing
      await surveySQLite.markSurveyCompleted(surveyId);
      setIsCompleted(true);

      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      console.error("Failed to complete survey", err);
    }
  }, [wizardState, currentSection, surveyId, state.answers, router]);

  if (!FEATURES.SURVEY_ENABLED) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Survey feature coming soon</Text>
      </View>
    );
  }

  // for preventing app crashing --- PARAM VALIDATION UI
  if (!memberId || !householdId) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-600">Invalid survey parameters</Text>
      </View>
    );
  }

  // UI sections
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

  // For complete Alert and redirection
  if (isCompleted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-green-600 text-xl font-semibold">
          Survey Completed Successfully 🎉
        </Text>

        <Text className="mt-2 text-gray-500">Redirecting...</Text>
      </SafeAreaView>
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
  const sectionMeta = SECTION_CONFIG[currentSection];
  // const questions = SECTION_QUESTIONS[currentSection];
  const isCurrentSectionComplete = activeSections.every((section) =>
    isSectionComplete(SECTION_QUESTIONS[section], state.answers),
  );
  console.log("[ANSWERS DEBUG]", state.answers);
  console.log("[WIZARD DEBUG]", {
    currentIndex,
    sections: wizardState?.sections,
    currentSection,
  });
  const {
    totalQuestions,
    answeredQuestions,
    progress: safeProgress,
  } = calculateSurveyProgress(activeSections, state.answers, SECTION_QUESTIONS);

  // Main survey UI
  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Temporary reset button  */}
        {/* <TouchableOpacity
          onPress={handleReset}
          className="bg-red-600 py-3 px-6 rounded-xl mt-4 mx-4 active:bg-red-700 mb-4"
        >
          <Text className="text-white text-center font-semibold text-base">
            Reset Surveys
          </Text>
        </TouchableOpacity> */}

        {/* Member form and member Info */}
        {memberState && profileState && (
          <View className="mb-4 p-4 border rounded-lg bg-gray-50">
            <Text className="font-semibold mb-2">Member Info</Text>

            <Text>
              Name: {memberState.firstName ?? ""} {memberState.lastName ?? ""}
            </Text>
            <Text>Gender: {profileState.gender}</Text>
            <Text>Age: {profileState.ageYears}</Text>
            <Text>Marital: {profileState.maritalStatus}</Text>
            <Text>Pregnant: {profileState.isPregnant ? "Yes" : "No"}</Text>
            <Text>Child Age Days: {profileState.childAgeDays ?? "-"}</Text>
          </View>
        )}

        <Text className="text-sm text-gray-500">
          Survey ID: {surveyId ?? "Pending"}
        </Text>

        {hasAttemptedNext && !isCurrentSectionComplete && (
          <Text className="text-red-500 text-sm mt-2">
            Please complete all required questions
          </Text>
        )}

        <Text className="mt-1 text-sm text-gray-500">
          {Math.round(safeProgress * 100)}% completed
        </Text>

        <View className="mt-6 rounded-xl border border-gray-200 p-5">
          {/* <Text className="text-sm text-gray-500">Current section</Text> */}
          <Text className="mt-2 text-xl font-semibold">
            {sectionMeta.title}
          </Text>

          <Text className="mt-1 text-sm text-gray-500">
            {answeredQuestions} of {totalQuestions} questions completed
          </Text>
          <View className="mt-3">
            <View className="h-2 w-full rounded-full bg-gray-200">
              <View
                className="h-2 rounded-full bg-blue-600"
                style={{ width: `${safeProgress * 100}%` }}
              />
            </View>
          </View>
        </View>

        {/* activeSections → multiple sections  */}
        <View className="mt-6">
          {activeSections.length === 0 ? (
            <Text className="text-gray-500 mt-4 text-center">
              No questions available for this section.
            </Text>
          ) : (
            activeSections.map((section) => {
              const sectionQuestions = SECTION_QUESTIONS[section];
              const sectionMeta = SECTION_CONFIG[section];

              return (
                <View key={section} className="mt-6">
                  {/* Section Title */}
                  <Text className="text-xl font-semibold">
                    {sectionMeta.title}
                  </Text>

                  {/* Section Questions */}
                  <SurveySectionRenderer
                    questions={sectionQuestions}
                    responses={state.answers}
                    errors={{ ...errors }}
                    savingStatus={{ ...savingStatus }}
                    dispatch={handleAnswer}
                  />
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Messages near buttons */}
      {hasPendingSaves && (
        <Text className="text-xs text-gray-500 text-center mb-2">
          Saving your responses...
        </Text>
      )}

      <View className="flex-row border-t border-gray-200 px-4 py-3">
        {/* BACK Button */}
        <Pressable
          onPress={handlePrevious}
          disabled={hasPendingSaves || isFirstSection}
          className={`mr-2 flex-1 rounded-lg py-3 ${
            isFirstSection ? "bg-gray-200" : "bg-gray-300"
          }`}
        >
          <Text className="text-center">Back</Text>
        </Pressable>

        {/* NEXT / FINISH Button */}
        <Pressable
          onPress={isLastSection ? handleFinish : handleNext}
          disabled={hasPendingSaves}
          className={`ml-2 flex-1 rounded-lg py-3 ${
            hasPendingSaves
              ? "bg-gray-300"
              : isLastSection
                ? isCurrentSectionComplete
                  ? "bg-green-500"
                  : "bg-gray-300"
                : "bg-blue-600"
          }`}
        >
          <Text className="text-center text-white">
            {isLastSection ? "Finish" : "Next"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
