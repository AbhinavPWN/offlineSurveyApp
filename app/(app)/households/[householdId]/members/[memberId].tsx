import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  householdMemberLocalRepository,
  householdLocalRepository,
} from "@/src/di/container";

import { MemberFormState } from "@/src/features/member-form/models/MemberFormState";
import { createEmptyMemberFormState } from "@/src/features/member-form/models/createEmptyMemberFormState";

import {
  mapLocalToForm,
  mapFormToLocalPatch,
} from "@/src/features/member-form/mappers/MemberFormLocalMapper";

import { BasicInfoStep } from "@/src/features/member-form/components/steps/BasicInfoStep";
import { AddressStep } from "@/src/features/member-form/components/steps/AddressStep";
import { OccupationStep } from "@/src/features/member-form/components/steps/OccupationStep";
import { FinancialStep } from "@/src/features/member-form/components/steps/FinancialStep";
import { HealthStep } from "@/src/features/member-form/components/steps/HealthStep";
import { ReviewStep } from "@/src/features/member-form/components/steps/ReviewStep";

import {
  validateBasicInfo,
  // validateAddressInfo,
  validateOccupationInfo,
  validateFinancialInfo,
} from "@/src/features/member-form/validation/MemberFormValidation";
import { validateHealthStep } from "@/src/features/member-form/validation/health.validation";
import { ErrorBoundary } from "@/src/features/member-form/components/ErrorBoundary";
import { AppLogger } from "@/src/utils/AppLogger";
import { HouseholdLocal } from "@/src/models/household.model";

/* 
   STEP CONFIG
*/

interface StepConfig {
  title: string;
  component: React.ComponentType<any>;
  validate?: (form: MemberFormState) => any;
}

const STEP_CONFIG: StepConfig[] = [
  {
    title: "Basic Info",
    component: BasicInfoStep,
    validate: validateBasicInfo,
  },
  {
    title: "Address",
    component: AddressStep,
    // validate: validateAddressInfo,
  },
  {
    title: "Occupation",
    component: OccupationStep,
    validate: validateOccupationInfo,
  },
  {
    title: "Financial",
    component: FinancialStep,
    validate: validateFinancialInfo,
  },
  {
    title: "Health",
    component: HealthStep,
    validate: validateHealthStep,
  },
  {
    title: "Review",
    component: ReviewStep,
  },
];

export default function MemberFormScreen() {
  const { memberId } = useLocalSearchParams();
  const localId = typeof memberId === "string" ? memberId : null;

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<MemberFormState | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [household, setHousehold] = useState<HouseholdLocal | null>(null);

  /*
     LOAD MEMBER
 */

  useEffect(() => {
    let mounted = true;

    async function loadMember() {
      try {
        if (!localId) {
          if (mounted) {
            setForm(createEmptyMemberFormState());
            setLoading(false);
          }
          return;
        }

        const member =
          await householdMemberLocalRepository.getByLocalId(localId);

        if (!mounted) return;

        if (member) {
          setForm(mapLocalToForm(member));
        } else {
          setForm(createEmptyMemberFormState());
        }

        setLoading(false);
      } catch {
        if (mounted) setLoading(false);
      }
    }

    loadMember();

    return () => {
      mounted = false;
    };
  }, [localId]);

  /* 
     UPDATE FIELD
  */

  const updateField = useCallback(
    <K extends keyof MemberFormState>(key: K, value: MemberFormState[K]) => {
      setForm((prev) => {
        if (!prev) return prev;
        if (prev[key] === value) return prev;
        return { ...prev, [key]: value };
      });

      setErrors((prev) => {
        if (!prev[key as string]) return prev;
        const newErrors = { ...prev };
        delete newErrors[key as string];
        return newErrors;
      });
    },
    [],
  );

  // Load household for review step and validation
  useEffect(() => {
    let mounted = true;

    async function loadHousehold() {
      try {
        if (!form?.householdLocalId) return;

        const data = await householdLocalRepository.getByLocalId(
          form.householdLocalId,
        );

        if (!mounted) return;

        setHousehold(data);
      } catch (e) {
        console.log("Failed to load household:", e);
      }
    }

    loadHousehold();

    return () => {
      mounted = false;
    };
  }, [form?.householdLocalId]);

  /* 
     SAVE DRAFT
 */

  const saveDraftToLocal = useCallback(async () => {
    try {
      if (!localId || !form) return;

      const patch = mapFormToLocalPatch(form);

      await householdMemberLocalRepository.updateDraft(localId, patch);
    } catch (error) {
      console.log("Draft save failed:", error);

      AppLogger.log("ERROR", "Member draft save failed", {
        error,
      });
    }
  }, [form, localId]);

  /* 
     STEP VALIDATION
  */

  const validateStep = useCallback(
    (stepIndex: number) => {
      if (!form) return true;

      const step = STEP_CONFIG[stepIndex];

      if (!step.validate) return true;

      const result = step.validate(form);

      if (!result || Object.keys(result.errors ?? result).length === 0) {
        return true;
      }

      setErrors(result.errors ?? result);

      return false;
    },
    [form],
  );

  /*
     NAVIGATION
 */

  const handleNext = useCallback(async () => {
    if (!validateStep(currentStep)) return;

    await saveDraftToLocal();

    setErrors({});
    setCurrentStep((prev) => prev + 1);
  }, [currentStep, saveDraftToLocal, validateStep]);

  const handleBack = useCallback(async () => {
    await saveDraftToLocal();
    setCurrentStep((prev) => prev - 1);
  }, [saveDraftToLocal]);

  const handleFinish = useCallback(async () => {
    try {
      if (!form || !localId) return;

      /* Validate all steps */

      let allErrors: Record<string, string> = {};

      STEP_CONFIG.forEach((step) => {
        if (!step.validate) return;

        const result = step.validate(form);

        const errs = result.errors ?? result;

        if (errs && Object.keys(errs).length > 0) {
          allErrors = { ...allErrors, ...errs };
        }
      });

      if (Object.keys(allErrors).length > 0) {
        setErrors(allErrors);
        setCurrentStep(0);
        return;
      }

      const patch = mapFormToLocalPatch(form);

      await householdMemberLocalRepository.updateDraft(localId, patch);

      const existing =
        await householdMemberLocalRepository.getByLocalId(localId);

      const syncAction = existing?.clientNo ? "UPDATE" : "INSERT";

      await householdMemberLocalRepository.markPending(localId, syncAction);

      router.back();
    } catch (error) {
      AppLogger.log("ERROR", "Member finish failed", { error });
    }
  }, [form, localId, router]);

  /*
     STEP RENDER
*/

  const StepComponent = STEP_CONFIG[currentStep].component;

  const stepTitle = STEP_CONFIG[currentStep].title;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEP_CONFIG.length - 1;

  /*
     LOADING
 */

  if (loading || !form) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    );
  }

  /* 
     UI
*/

  return (
    <ErrorBoundary>
      <Stack.Screen options={{ title: "Member Details" }} />

      <SafeAreaView edges={["bottom"]} className="flex-1 bg-white">
        <ScrollView
          className="flex-1 px-4 pt-4"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-sm text-gray-500 mb-2">
            Step {currentStep + 1} of {STEP_CONFIG.length}
          </Text>

          <Text className="text-xl font-bold mb-4">{stepTitle}</Text>

          {STEP_CONFIG[currentStep].title === "Review" ? (
            household ? (
              <StepComponent form={form} household={household} />
            ) : (
              <ActivityIndicator />
            )
          ) : (
            <StepComponent
              form={form}
              updateField={updateField}
              errors={errors}
              householdLocalId={form.householdLocalId}
            />
          )}
        </ScrollView>

        {/* Footer Navigation */}

        <View className="px-4 py-2 pt-3 pb-4 border-t border-gray-200 bg-white">
          <View className="flex-row justify-between">
            {!isFirstStep ? (
              <Pressable
                onPress={handleBack}
                className="flex-1 mr-2 py-3 bg-gray-300 rounded-lg"
              >
                <Text className="text-center">Back</Text>
              </Pressable>
            ) : (
              <View className="flex-1 mr-2" />
            )}

            {!isLastStep ? (
              <Pressable
                onPress={handleNext}
                className="flex-1 ml-2 py-3 bg-blue-600 rounded-lg"
              >
                <Text className="text-white text-center font-semibold">
                  Next
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleFinish}
                className="flex-1 ml-2 py-3 bg-green-600 rounded-lg"
              >
                <Text className="text-white text-center font-semibold">
                  Finish
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
}
