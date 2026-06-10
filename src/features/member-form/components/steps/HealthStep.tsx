import React from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { MemberFormState } from "../../models/MemberFormState";
import { FormDropdown } from "../FormDropdown";
import { BSDateInput } from "../BSDateInput";
import {
  yesNoOptions,
  difficultyOptions,
} from "../../master/memberHealthMasterData";
import { DifficultyLevel, DisabilityType } from "../../master/health.enum";

interface Props {
  form: MemberFormState;
  updateField: <K extends keyof MemberFormState>(
    key: K,
    value: MemberFormState[K],
  ) => void;
  errors?: Record<string, string>;
  registerField: (fieldName: string) => (node: View | null) => void;
}

const disabilityTypeOptions = [
  {
    labelEn: "Vision",
    labelNp: "दृष्टि सम्बन्धी",
    value: DisabilityType.VISION,
  },
  {
    labelEn: "Hearing",
    labelNp: "सुनाइ सम्बन्धी",
    value: DisabilityType.HEARING,
  },
  {
    labelEn: "Mobility",
    labelNp: "हिँडडुल सम्बन्धी",
    value: DisabilityType.MOBILITY,
  },
  {
    labelEn: "Cognition",
    labelNp: "स्मरण/बुझाइ सम्बन्धी",
    value: DisabilityType.COGNITION,
  },
  {
    labelEn: "Self Care",
    labelNp: "आफ्नो हेरचाह सम्बन्धी",
    value: DisabilityType.SELF_CARE,
  },
  {
    labelEn: "Communication",
    labelNp: "सञ्चार सम्बन्धी",
    value: DisabilityType.COMMUNICATION,
  },
  {
    labelEn: "Affect",
    labelNp: "भावनात्मक/मानसिक",
    value: DisabilityType.AFFECT,
  },
  {
    labelEn: "Upper Body",
    labelNp: "माथिल्लो शरीर सम्बन्धी",
    value: DisabilityType.UPPER_BODY,
  },
  {
    labelEn: "Pain",
    labelNp: "दुखाइ सम्बन्धी",
    value: DisabilityType.PAIN,
  },
  {
    labelEn: "Fatigue",
    labelNp: "थकान सम्बन्धी",
    value: DisabilityType.FATIGUE,
  },
];

export const HealthStep = React.memo(function HealthStep({
  form,
  updateField,
  errors,
  registerField,
}: Props) {
  const isFemale = form.gender === "F";

  // For Vaccination
  const clientAgeNumber =
    form.clientAge !== null &&
    form.clientAge !== undefined &&
    form.clientAge !== ""
      ? Number(form.clientAge)
      : null;

  const isVaccinationAge =
    clientAgeNumber !== null &&
    Number.isFinite(clientAgeNumber) &&
    clientAgeNumber >= 0 &&
    clientAgeNumber <= 5;

  const hasSelectedHealthCondition = React.useMemo(() => {
    return (
      form.healthConditionsDia ||
      form.healthConditionsHyp ||
      form.healthConditionsCar ||
      form.healthConditionsChr ||
      form.healthConditionsOth ||
      Boolean(form.healthConditionsOthers?.trim())
    );
  }, [
    form.healthConditionsDia,
    form.healthConditionsHyp,
    form.healthConditionsCar,
    form.healthConditionsChr,
    form.healthConditionsOth,
    form.healthConditionsOthers,
  ]);

  const clearHealthConditions = React.useCallback(() => {
    updateField("healthConditionsDia", false);
    updateField("healthConditionsHyp", false);
    updateField("healthConditionsCar", false);
    updateField("healthConditionsChr", false);
    updateField("healthConditionsOth", false);
    updateField("healthConditionsOthers", "");
  }, [updateField]);

  const handleHasHealthConditionChange = React.useCallback(
    (value: "Y" | "N") => {
      updateField("hasHealthCondition", value);

      if (value === "N") {
        clearHealthConditions();
      }
    },
    [updateField, clearHealthConditions],
  );

  React.useEffect(() => {
    if (form.hasHealthCondition === "N" && hasSelectedHealthCondition) {
      clearHealthConditions();
    }
  }, [
    form.hasHealthCondition,
    hasSelectedHealthCondition,
    clearHealthConditions,
  ]);

  const hasFunctionalDifficulty = React.useMemo(() => {
    const functionalDifficultyValues = [
      form.seeing,
      form.hearing,
      form.walking,
      form.remembering,
      form.selfCare,
      form.communicating,
    ];

    return functionalDifficultyValues.some(
      (value) =>
        value !== null &&
        value !== undefined &&
        value !== "" &&
        value !== DifficultyLevel.NO_DIFFICULTY,
    );
  }, [
    form.seeing,
    form.hearing,
    form.walking,
    form.remembering,
    form.selfCare,
    form.communicating,
  ]);

  React.useEffect(() => {
    if (form.disabilityIdentYn !== hasFunctionalDifficulty) {
      updateField("disabilityIdentYn", hasFunctionalDifficulty);
    }

    if (!hasFunctionalDifficulty && form.disabilityIdent) {
      updateField("disabilityIdent", "");
    }
  }, [
    hasFunctionalDifficulty,
    form.disabilityIdentYn,
    form.disabilityIdent,
    updateField,
  ]);

  const CheckboxCard = ({
    labelEn,
    labelNp,
    checked,
    onPress,
  }: {
    labelEn: string;
    labelNp: string;
    checked: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center p-4 rounded-xl border mt-2 ${
        checked ? "bg-blue-50 border-blue-500" : "border-gray-300"
      }`}
    >
      <Text className="text-xl mr-3">{checked ? "☑" : "☐"}</Text>

      <View>
        <Text className="text-base font-medium">{labelEn}</Text>
        <Text className="text-gray-500 text-sm">{labelNp}</Text>
      </View>
    </Pressable>
  );

  return (
    <View className="space-y-5">
      {/* Health Conditions */}
      <View>
        <View ref={registerField("hasHealthCondition")} collapsable={false}>
          <FormDropdown
            label="Does this member have any health condition? (के यो सदस्यलाई कुनै स्वास्थ्य समस्या छ?) *"
            value={form.hasHealthCondition}
            options={yesNoOptions}
            onChange={(val) => handleHasHealthConditionChange(val as "Y" | "N")}
          />

          {errors?.hasHealthCondition && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.hasHealthCondition}
            </Text>
          )}
        </View>

        {form.hasHealthCondition === "N" && (
          <View className="border border-green-300 bg-green-50 rounded-lg px-3 py-3 mt-3">
            <Text className="text-green-700 font-medium">
              Health condition questions skipped.
            </Text>

            <Text className="text-green-600 text-xs mt-1">
              This member has no reported health condition.
            </Text>
          </View>
        )}

        {form.hasHealthCondition === "Y" && (
          <View className="mt-4">
            <Text className="text-lg font-semibold">Health Conditions</Text>

            <Text className="text-gray-500 mb-2">स्वास्थ्य समस्या</Text>

            <Text className="text-gray-400 text-sm mb-2">
              Select all that apply
            </Text>

            <View className="space-y-3">
              <CheckboxCard
                labelEn="Diabetes"
                labelNp="मधुमेह"
                checked={form.healthConditionsDia}
                onPress={() =>
                  updateField("healthConditionsDia", !form.healthConditionsDia)
                }
              />

              <CheckboxCard
                labelEn="Hypertension"
                labelNp="उच्च रक्तचाप"
                checked={form.healthConditionsHyp}
                onPress={() =>
                  updateField("healthConditionsHyp", !form.healthConditionsHyp)
                }
              />

              <CheckboxCard
                labelEn="Cardiovascular Disease"
                labelNp="मुटु सम्बन्धी रोग"
                checked={form.healthConditionsCar}
                onPress={() =>
                  updateField("healthConditionsCar", !form.healthConditionsCar)
                }
              />

              <CheckboxCard
                labelEn="Chronic Lung Disease"
                labelNp="फोक्सो सम्बन्धी पुरानो रोग"
                checked={form.healthConditionsChr}
                onPress={() =>
                  updateField("healthConditionsChr", !form.healthConditionsChr)
                }
              />

              <CheckboxCard
                labelEn="Other"
                labelNp="अन्य"
                checked={form.healthConditionsOth}
                onPress={() => {
                  const nextValue = !form.healthConditionsOth;

                  updateField("healthConditionsOth", nextValue);

                  if (!nextValue) {
                    updateField("healthConditionsOthers", "");
                  }
                }}
              />

              {errors?.hasHealthCondition && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.hasHealthCondition}
                </Text>
              )}

              {form.healthConditionsOth && (
                <View
                  className="mt-2"
                  ref={registerField("healthConditionsOthers")}
                  collapsable={false}
                >
                  <Text className="text-sm text-gray-500 mb-1">
                    Specify other condition
                  </Text>

                  <TextInput
                    className={`border rounded-lg px-3 py-4 ${
                      errors?.healthConditionsOthers
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter condition"
                    value={form.healthConditionsOthers ?? ""}
                    onChangeText={(text) =>
                      updateField("healthConditionsOthers", text)
                    }
                  />

                  {errors?.healthConditionsOthers && (
                    <Text className="text-red-500 text-sm mt-1">
                      {errors.healthConditionsOthers}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Functional Difficulties */}
      <View className="mt-6">
        <Text className="font-medium mb-2">
          Functional Difficulties (कार्यात्मक कठिनाइ)
        </Text>

        <View ref={registerField("seeing")} collapsable={false}>
          <FormDropdown
            label="Seeing"
            value={form.seeing}
            options={difficultyOptions}
            onChange={(val) => updateField("seeing", val)}
          />
        </View>

        <View ref={registerField("hearing")} collapsable={false}>
          <FormDropdown
            label="Hearing"
            value={form.hearing}
            options={difficultyOptions}
            onChange={(val) => updateField("hearing", val)}
          />
        </View>

        <View ref={registerField("walking")} collapsable={false}>
          <FormDropdown
            label="Walking"
            value={form.walking}
            options={difficultyOptions}
            onChange={(val) => updateField("walking", val)}
          />
        </View>

        <View ref={registerField("remembering")} collapsable={false}>
          <FormDropdown
            label="Remembering"
            value={form.remembering}
            options={difficultyOptions}
            onChange={(val) => updateField("remembering", val)}
          />
        </View>

        <View ref={registerField("selfCare")} collapsable={false}>
          <FormDropdown
            label="Self Care"
            value={form.selfCare}
            options={difficultyOptions}
            onChange={(val) => updateField("selfCare", val)}
          />
        </View>

        <View ref={registerField("communicating")} collapsable={false}>
          <FormDropdown
            label="Communicating"
            value={form.communicating}
            options={difficultyOptions}
            onChange={(val) => updateField("communicating", val)}
          />
        </View>
      </View>

      {/* Auto Disability Identification */}
      <View
        className="mt-6"
        ref={registerField("disabilityIdentYn")}
        collapsable={false}
      >
        <Text className="font-medium mb-1">
          Disability Identified? (अपाङ्गता छ?)
        </Text>

        <View
          className={`border rounded-lg px-3 py-4 ${
            form.disabilityIdentYn
              ? "border-green-500 bg-green-50"
              : "border-gray-300 bg-gray-50"
          }`}
        >
          <Text
            className={`font-semibold ${
              form.disabilityIdentYn ? "text-green-700" : "text-gray-700"
            }`}
          >
            {form.disabilityIdentYn ? "Yes" : "No"}
          </Text>

          <Text className="text-xs text-gray-500 mt-1">
            Auto-calculated from functional difficulties.
          </Text>
        </View>

        {errors?.disabilityIdentYn && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.disabilityIdentYn}
          </Text>
        )}
      </View>

      {/* Disability Type */}
      {form.disabilityIdentYn && (
        <View
          className="mt-6"
          ref={registerField("disabilityIdent")}
          collapsable={false}
        >
          <FormDropdown
            label="Disability Type (अपाङ्गताको प्रकार)"
            value={form.disabilityIdent}
            options={disabilityTypeOptions}
            onChange={(val) => updateField("disabilityIdent", val)}
          />

          {errors?.disabilityIdent && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.disabilityIdent}
            </Text>
          )}
        </View>
      )}

      {/* Pregnancy */}
      {isFemale && (
        <View className="mt-6">
          <FormDropdown
            label="Pregnancy Status (गर्भावस्था स्थिति)"
            value={form.pregnancyStatus ?? "N"}
            options={yesNoOptions}
            onChange={(val) => updateField("pregnancyStatus", val)}
          />

          {form.pregnancyStatus === "Y" && (
            <View ref={registerField("pregnancyDate")} collapsable={false}>
              <BSDateInput
                label="Last Menstrual Period (LMP) / गर्भवती महिलाको अन्तिम महिनाबारी (LMP) - (B.S)"
                adValue={form.pregnancyDate}
                onChangeAD={(adIso) => updateField("pregnancyDate", adIso)}
              />

              {errors?.pregnancyDate && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.pregnancyDate}
                </Text>
              )}
            </View>
          )}

          <FormDropdown
            label="Mother of Child? (बच्चाको आमा हो?)"
            value={form.motherofChild ? "Y" : "N"}
            options={yesNoOptions}
            onChange={(val) => {
              const isMother = val === "Y";

              updateField("motherofChild", isMother);

              if (!isMother) {
                updateField("childDob", "");
              }
            }}
          />

          {form.motherofChild && (
            <View ref={registerField("childDob")} collapsable={false}>
              <BSDateInput
                label="Child Date of Birth (बच्चाको जन्म मिति)"
                adValue={form.childDob}
                onChangeAD={(adIso) => updateField("childDob", adIso)}
              />

              {errors?.childDob && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.childDob}
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Vaccination - only for age <= 5 */}
      {isVaccinationAge && (
        <View ref={registerField("vaccinationStatus")} collapsable={false}>
          <FormDropdown
            label="Vaccination Status (खोप स्थिति)"
            value={form.vaccinationStatus}
            options={yesNoOptions}
            onChange={(val) => updateField("vaccinationStatus", val)}
          />

          {errors?.vaccinationStatus && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.vaccinationStatus}
            </Text>
          )}
        </View>
      )}

      {/* Insurance */}
      <View ref={registerField("healthInsCoverage")} collapsable={false}>
        <FormDropdown
          label="Health Insurance Coverage (स्वास्थ्य बीमा)"
          value={form.healthInsCoverage}
          options={yesNoOptions}
          onChange={(val) => updateField("healthInsCoverage", val)}
        />
      </View>
    </View>
  );
});
