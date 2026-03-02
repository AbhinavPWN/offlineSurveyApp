import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { householdMemberLocalRepository } from "@/src/di/container";
import { MemberFormState } from "@/src/features/member-form/models/MemberFormState";
import { createEmptyMemberFormState } from "@/src/features/member-form/models/createEmptyMemberFormState";
import {
  mapLocalToForm,
  mapFormToLocalPatch,
} from "@/src/features/member-form/mappers/MemberFormLocalMapper";
import { BasicInfoStep } from "@/src/features/member-form/components/steps/BasicInfoStep";
import {
  validateBasicInfo,
  validateIdentityInfo,
  validateAddressInfo,
  validateOccupationInfo,
  validateFinancialInfo,
} from "@/src/features/member-form/validation/MemberFormValidation";
import { validateHealthStep } from "@/src/features/member-form/validation/health.validation";
import { SafeAreaView } from "react-native-safe-area-context";
import { IdentityStep } from "@/src/features/member-form/components/steps/IdentityStep";
import { AddressStep } from "@/src/features/member-form/components/steps/AddressStep";
import { OccupationStep } from "@/src/features/member-form/components/steps/OccupationStep";
import { FinancialStep } from "@/src/features/member-form/components/steps/FinancialStep";
import { HealthStep } from "@/src/features/member-form/components/steps/HealthStep";
import { ReviewStep } from "@/src/features/member-form/components/steps/ReviewStep";
import { AppLogger } from "@/src/utils/AppLogger";

const steps = [
  "Basic Info",
  "Identity",
  "Address",
  "Occupation",
  "Financial",
  "Health",
  "Review",
];

export default function MemberFormScreen() {
  const { memberId } = useLocalSearchParams();
  const localId = typeof memberId === "string" ? memberId : null;

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<MemberFormState | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();

  // For DEbugging
  const renderCount = React.useRef(0);
  renderCount.current++;
  console.log(
    "MemberFormScreen render:",
    renderCount.current,
    "Step:",
    currentStep,
  );

  // Type-safe updates (optimized)
  const updateField = useCallback(
    <K extends keyof MemberFormState>(key: K, value: MemberFormState[K]) => {
      setForm((prev) => {
        if (!prev) return prev;

        // 🔥 Prevent unnecessary re-render
        if (prev[key] === value) {
          return prev;
        }

        return { ...prev, [key]: value };
      });

      setErrors((prev) => {
        // 🔥 Only update errors if needed
        if (!prev[key as string]) return prev;

        const newErrors = { ...prev };
        delete newErrors[key as string];
        return newErrors;
      });
    },
    [],
  );

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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMember();

    return () => {
      mounted = false;
    };
  }, [localId]);

  if (loading || !form) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    );
  }

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // Save Function
  const saveDraftToLocal = async () => {
    try {
      if (!localId || !form) return;
      const patch = mapFormToLocalPatch(form);
      await householdMemberLocalRepository.updateDraft(localId, patch);
    } catch (error) {
      console.log("Draft save failed:", error);
      AppLogger.log("ERROR", "Member DRAFT Save Failed", {
        message: { error },
      });
    }
  };
  console.log("MemberFormScreen render", currentStep);
  // Handle Next button Function

  const handleNext = async () => {
    if (currentStep === 0) {
      const result = validateBasicInfo(form);
      if (!result.isValid) {
        setErrors(result.errors as Record<string, string>);
        return;
      }
    }

    if (currentStep === 1) {
      const result = validateIdentityInfo(form);
      if (!result.isValid) {
        setErrors(result.errors as Record<string, string>);
        return;
      }
    }

    if (currentStep === 2) {
      const result = validateAddressInfo(form);
      if (!result.isValid) {
        setErrors(result.errors as Record<string, string>);
        return;
      }
    }

    if (currentStep === 3) {
      const result = validateOccupationInfo(form);
      if (!result.isValid) {
        setErrors(result.errors as Record<string, string>);
        return;
      }
    }

    if (currentStep === 4) {
      const result = validateFinancialInfo(form);
      if (!result.isValid) {
        setErrors(result.errors as Record<string, string>);
        return;
      }
    }

    if (currentStep === 5) {
      const result = validateHealthStep(form);
      if (Object.keys(result).length > 0) {
        setErrors(result as Record<string, string>);
        return;
      }
    }

    setErrors({});
    // Save before moving
    await saveDraftToLocal();
    setCurrentStep((prev) => prev + 1);
  };

  // Handle Finish

  const handleFinish = async () => {
    try {
      if (!form || !localId) return;

      // Run ALL validations
      const basic = validateBasicInfo(form);
      const identity = validateIdentityInfo(form);
      const address = validateAddressInfo(form);
      const occupation = validateOccupationInfo(form);
      const financial = validateFinancialInfo(form);
      const health = validateHealthStep(form);

      const allErrors = {
        ...(basic.errors ?? {}),
        ...(identity.errors ?? {}),
        ...(address.errors ?? {}),
        ...(occupation.errors ?? {}),
        ...(financial.errors ?? {}),
        ...(health ?? {}),
      };

      if (Object.keys(allErrors).length > 0) {
        setErrors(allErrors);
        // Optionally go to first step if serious
        setCurrentStep(0);
        return;
      }

      // Save latest draft
      const patch = mapFormToLocalPatch(form);

      if (__DEV__) console.log("FINISH START");
      await householdMemberLocalRepository.updateDraft(localId, patch);

      // Determine sync action
      const existing =
        await householdMemberLocalRepository.getByLocalId(localId);

      const syncAction = existing?.clientNo ? "UPDATE" : "INSERT";
      if (__DEV__) console.log("DRAFT UPDATED");
      await householdMemberLocalRepository.markPending(localId, syncAction);
      if (__DEV__) console.log("MARKED PENDING");
      // Navigate back
      router.back();
    } catch (error) {
      // console.log("Finish failed:", error);
      AppLogger.log("ERROR", "Finish button working Failed", {
        message: { error },
      });
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-white">
      {/* Scrollable Content */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress Indicator */}
        <Text className="text-sm text-gray-500 mb-2">
          Step {currentStep + 1} of {steps.length}
        </Text>

        <Text className="text-xl font-bold mb-4">{steps[currentStep]}</Text>

        {/* Step Content */}

        {/* Basic INFO */}
        {currentStep === 0 && (
          <BasicInfoStep
            form={form}
            updateField={updateField}
            errors={errors}
          />
        )}

        {/* Identity STEP */}
        {currentStep === 1 && (
          <IdentityStep form={form} updateField={updateField} errors={errors} />
        )}

        {/* Address Step */}
        {currentStep === 2 && (
          <AddressStep form={form} updateField={updateField} errors={errors} />
        )}

        {/* Occupation Step */}
        {currentStep === 3 && (
          <OccupationStep
            form={form}
            updateField={updateField}
            errors={errors}
          />
        )}

        {/* Financial Step  */}
        {currentStep === 4 && (
          <FinancialStep
            form={form}
            updateField={updateField}
            errors={errors}
          />
        )}

        {/* Health Step */}
        {currentStep === 5 && (
          <HealthStep form={form} updateField={updateField} errors={errors} />
        )}

        {/* Review Step */}
        {currentStep === 6 && <ReviewStep form={form} />}

        {/* Add other steps here when ready */}
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View className="px-4 py-2 pt-3 pb-4 border-t border-gray-200 bg-white">
        <View className="flex-row justify-between">
          {!isFirstStep ? (
            <Pressable
              onPress={async () => {
                await saveDraftToLocal();
                setCurrentStep((prev) => prev - 1);
              }}
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
              <Text className="text-white text-center font-semibold">Next</Text>
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
  );
}
