import React from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { MemberFormState } from "../../models/MemberFormState";
import { FormDropdown } from "../FormDropdown";
import { BSDateInput } from "../BSDateInput";
import {
  yesNoOptions,
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
            <View className="mt-2">
              <Text className="text-sm text-gray-500 mb-1">
                Specify other condition
              </Text>

              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-4"
                placeholder="Enter condition"
                value={form.healthConditionsOthers ?? ""}
                onChangeText={(text) =>
                  updateField("healthConditionsOthers", text)
                }
              />
            </View>
          )}
        </View>
      </View>

      {/* Disability Identification */}
      <View className="mt-6">
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
          </>
        )}
      </View>

      {/* Disability Status */}
      <View className="mt-6">
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
            <BSDateInput
              label="Pregnancy Date (B.S.)"
              adValue={form.pregnancyDate}
              onChangeAD={(adIso) => updateField("pregnancyDate", adIso)}
            />
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
            <BSDateInput
              label="Child Date of Birth (B.S.)"
              adValue={form.childDob}
              onChangeAD={(adIso) => updateField("childDob", adIso)}
            />
          )}
        </View>
      )}

      {/* Vaccination */}
      {form.minorYn && (
        <FormDropdown
          label="Vaccination Status (खोप स्थिति)"
          value={form.vaccinationStatus ?? "N"}
          options={yesNoOptions}
          onChange={(val) => updateField("vaccinationStatus", val)}
        />
      )}

      {/* Insurance */}
      <FormDropdown
        label="Health Insurance Coverage (स्वास्थ्य बीमा)"
        value={form.healthInsCoverage}
        options={yesNoOptions}
        onChange={(val) => updateField("healthInsCoverage", val)}
      />
    </View>
  );
});
