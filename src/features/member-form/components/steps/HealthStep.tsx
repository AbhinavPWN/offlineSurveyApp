import React from "react";
import { View, Text } from "react-native";
import { MemberFormState } from "../../models/MemberFormState";
import { FormDropdown } from "../FormDropdown";
import { BSDateInput } from "../BSDateInput";
import {
  yesNoOptions,
  healthConditionOptions,
  disabilityTypeOptions,
  difficultyOptions,
} from "../../master/memberHealthMasterData";

interface Props {
  form: MemberFormState;
  updateField: <K extends keyof MemberFormState>(
    key: K,
    value: MemberFormState[K],
  ) => void;
  errors?: Record<string, string>;
}

export const HealthStep = React.memo(function HealthStep({
  form,
  updateField,
  errors,
}: Props) {
  if (__DEV__) console.log("HealthStep render");

  const isFemale = form.gender === "F";

  return (
    <View className="space-y-4">
      {/* Health Condition */}
      <FormDropdown
        label="Any Health Condition? (स्वास्थ्य समस्या छ?)"
        value={form.healthConditionsYn ? "Y" : "N"}
        options={yesNoOptions}
        onChange={(val) => updateField("healthConditionsYn", val === "Y")}
      />

      {form.healthConditionsYn && (
        <>
          <FormDropdown
            label="Select Health Condition (रोग चयन गर्नुहोस्)"
            value={form.healthConditions}
            options={healthConditionOptions}
            onChange={(val) => updateField("healthConditions", val)}
          />
          {errors?.healthConditions && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.healthConditions}
            </Text>
          )}
        </>
      )}

      {/* Disability Identification */}
      <FormDropdown
        label="Disability Identified? (अपाङ्गता छ?)"
        value={form.disabilityIdentYn ? "Y" : "N"}
        options={yesNoOptions}
        onChange={(val) => updateField("disabilityIdentYn", val === "Y")}
      />

      {form.disabilityIdentYn && (
        <>
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
        </>
      )}

      {/* Disability Status */}
      <FormDropdown
        label="Disability Status (अपाङ्गता स्थिति)"
        value={form.disabilityStatus ?? "N"}
        options={yesNoOptions}
        onChange={(val) => updateField("disabilityStatus", val)}
      />

      {form.disabilityStatus === "Y" && (
        <>
          <Text className="font-medium mt-2">
            Functional Difficulties (कार्यात्मक कठिनाइ)
          </Text>

          <FormDropdown
            label="Seeing"
            value={form.seeing}
            options={difficultyOptions}
            onChange={(val) => updateField("seeing", val)}
          />

          <FormDropdown
            label="Hearing"
            value={form.hearing}
            options={difficultyOptions}
            onChange={(val) => updateField("hearing", val)}
          />

          <FormDropdown
            label="Walking"
            value={form.walking}
            options={difficultyOptions}
            onChange={(val) => updateField("walking", val)}
          />

          <FormDropdown
            label="Remembering"
            value={form.remembering}
            options={difficultyOptions}
            onChange={(val) => updateField("remembering", val)}
          />

          <FormDropdown
            label="Self Care"
            value={form.selfCare}
            options={difficultyOptions}
            onChange={(val) => updateField("selfCare", val)}
          />

          <FormDropdown
            label="Communicating"
            value={form.communicating}
            options={difficultyOptions}
            onChange={(val) => updateField("communicating", val)}
          />
        </>
      )}
      {errors?.disabilityDifficulty && (
        <Text className="text-red-500 text-xs mt-1">
          {errors.disabilityDifficulty}
        </Text>
      )}

      {/* Pregnancy (Only Female) */}
      {isFemale && (
        <>
          <FormDropdown
            label="Pregnancy Status (गर्भावस्था स्थिति)"
            value={form.pregnancyStatus ?? "N"}
            options={yesNoOptions}
            onChange={(val) => updateField("pregnancyStatus", val)}
          />

          {form.pregnancyStatus === "Y" && (
            <>
              <BSDateInput
                label="Pregnancy Date (B.S.)"
                adValue={form.pregnancyDate}
                onChangeAD={(adIso) => updateField("pregnancyDate", adIso)}
              />
              {errors?.pregnancyDate && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.pregnancyDate}
                </Text>
              )}
            </>
          )}

          {/* Mother of Child */}
          <FormDropdown
            label="Mother of Child? (बच्चाको आमा हो?)"
            value={form.motherofChild ? "Y" : "N"}
            options={yesNoOptions}
            onChange={(val) => {
              const isMother = val === "Y";
              updateField("motherofChild", isMother);

              // Auto-clear child DOB if switched to No
              if (!isMother) {
                updateField("childDob", "");
              }
            }}
          />

          {form.motherofChild && (
            <>
              <BSDateInput
                label="Child Date of Birth (B.S.)"
                adValue={form.childDob}
                onChangeAD={(adIso) => updateField("childDob", adIso)}
              />
              {errors?.childDob && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.childDob}
                </Text>
              )}
            </>
          )}
        </>
      )}

      {/* Vaccination (Only Minor) */}
      {form.minorYn && (
        <>
          <FormDropdown
            label="Vaccination Status (खोप स्थिति)"
            value={form.vaccinationStatus ?? "N"}
            options={yesNoOptions}
            onChange={(val) => updateField("vaccinationStatus", val)}
          />
          {errors?.vaccinationStatus && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.vaccinationStatus}
            </Text>
          )}
        </>
      )}

      {/* Health Insurance */}
      <FormDropdown
        label="Health Insurance Coverage (स्वास्थ्य बीमा)"
        value={form.healthInsCoverage}
        options={yesNoOptions}
        onChange={(val) => updateField("healthInsCoverage", val)}
      />
    </View>
  );
});
