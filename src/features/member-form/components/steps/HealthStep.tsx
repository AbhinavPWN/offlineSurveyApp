import React from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { MemberFormState } from "../../models/MemberFormState";
import { FormDropdown } from "../FormDropdown";
import { BSDateInput } from "../BSDateInput";
import {
  yesNoOptions,
  difficultyOptions,
} from "../../master/memberHealthMasterData";

interface Props {
  form: MemberFormState;
  updateField: <K extends keyof MemberFormState>(
    key: K,
    value: MemberFormState[K],
  ) => void;
  errors?: Record<string, string>;
  registerField: (fieldName: string) => (node: View | null) => void;
}

export const HealthStep = React.memo(function HealthStep({
  form,
  updateField,
  errors,
  registerField,
}: Props) {
  const isFemale = form.gender === "F";

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
            onPress={() =>
              updateField("healthConditionsOth", !form.healthConditionsOth)
            }
          />

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

      {/* Disability Identification */}
      <View
        className="mt-6"
        ref={registerField("disabilityIdent")}
        collapsable={false}
      >
        <FormDropdown
          label="Disability Identified? (अपाङ्गता छ?)"
          value={form.disabilityIdentYn ? "Y" : "N"}
          options={yesNoOptions}
          onChange={(val) => updateField("disabilityIdentYn", val === "Y")}
        />

        {errors?.disabilityIdent && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.disabilityIdent}
          </Text>
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
                label="Pregnancy Date (B.S.)"
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
                label="Child Date of Birth (B.S.)"
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

      {/* Vaccination */}
      {form.minorYn && (
        <View ref={registerField("vaccinationStatus")} collapsable={false}>
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
