import React from "react";
import { View, Text, TextInput, Switch, Pressable } from "react-native";
import { MemberFormState } from "../../models/MemberFormState";

interface Props {
  form: MemberFormState;
  updateField: <K extends keyof MemberFormState>(
    key: K,
    value: MemberFormState[K],
  ) => void;
  errors?: Record<string, string>;

  registerField: (fieldName: string) => (node: View | null) => void;
}

export const FinancialStep = React.memo(function FinancialStep({
  form,
  updateField,
  errors,
  registerField,
}: Props) {
  if (__DEV__) console.log("FinancialStep render");

  const calculatedNetWorth =
    Number(form.totalAsset || 0) - Number(form.totalLiabilities || 0);

  React.useEffect(() => {
    if (form.earnsIncome === "N") {
      if (form.netWorth !== 0) {
        updateField("netWorth", 0);
      }

      return;
    }

    if (form.netWorth !== calculatedNetWorth) {
      updateField("netWorth", calculatedNetWorth);
    }
  }, [calculatedNetWorth, form.earnsIncome, form.netWorth, updateField]);

  const handleEarnsIncomeChange = React.useCallback(
    (value: "Y" | "N") => {
      updateField("earnsIncome", value);

      if (value === "N") {
        updateField("totalAsset", 0);
        updateField("totalLiabilities", 0);
        updateField("netWorth", 0);

        updateField("soiSalary", false);
        updateField("soiBusIncome", false);
        updateField("soiAgriculture", false);
        updateField("soiReturnfrmInvest", false);
        updateField("soiInheritance", false);
        updateField("soiRemittance", false);
        updateField("soiOthers", false);
      }
    },
    [updateField],
  );

  const handleNumberChange = React.useCallback(
    (key: "totalAsset" | "totalLiabilities", text: string) => {
      const numericText = text.replace(/\D/g, "");
      updateField(key, numericText ? Number(numericText) : 0);
    },
    [updateField],
  );

  const incomeOptions = [
    {
      key: "soiSalary",
      label: "Salary / तलब",
    },
    {
      key: "soiBusIncome",
      label: "Business / व्यवसाय",
    },
    {
      key: "soiAgriculture",
      label: "Agriculture / कृषि",
    },
    {
      key: "soiReturnfrmInvest",
      label: "Investment Return / लगानी आम्दानी",
    },
    {
      key: "soiInheritance",
      label: "Inheritance / पैतृक",
    },
    {
      key: "soiRemittance",
      label: "Remittance / रेमिटेन्स",
    },
    {
      key: "soiOthers",
      label: "Others / अन्य",
    },
  ] as const;

  return (
    <View className="space-y-4">
      {/* Earns Income */}
      <View ref={registerField("earnsIncome")} collapsable={false}>
        <Text className="mb-2 font-medium">
          Does this member have income? (के यो सदस्यको आम्दानी छ?) *
        </Text>

        <View className="flex-row gap-3 py-2">
          <Pressable
            onPress={() => handleEarnsIncomeChange("Y")}
            className={`flex-1 rounded-lg border px-4 py-3 ${
              form.earnsIncome === "Y"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 bg-white"
            }`}
          >
            <Text
              className={`text-center font-medium ${
                form.earnsIncome === "Y" ? "text-blue-700" : "text-gray-700"
              }`}
            >
              Yes (छ)
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleEarnsIncomeChange("N")}
            className={`flex-1 rounded-lg border px-4 py-3 ${
              form.earnsIncome === "N"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 bg-white"
            }`}
          >
            <Text
              className={`text-center font-medium ${
                form.earnsIncome === "N" ? "text-blue-700" : "text-gray-700"
              }`}
            >
              No (छैन)
            </Text>
          </Pressable>
        </View>

        {errors?.earnsIncome && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.earnsIncome}
          </Text>
        )}
      </View>

      {form.earnsIncome === "N" && (
        <View className="border border-green-300 bg-green-50 rounded-lg px-3 py-3">
          <Text className="text-green-700 font-medium">
            Financial questions skipped.
          </Text>

          <Text className="text-green-600 text-xs mt-1">
            This member has no income. Monthly income, monthly expenses, monthly
            saving and source of income will be saved as default values.
          </Text>
        </View>
      )}

      {form.earnsIncome === "Y" && (
        <>
          {/* Monthly Income */}
          <View ref={registerField("totalAsset")} collapsable={false}>
            <Text className="mb-1 font-medium">
              Monthly Income (मासिक आय) *
            </Text>

            <TextInput
              className={`border rounded-lg px-3 py-2 ${
                errors?.totalAsset ? "border-red-500" : "border-gray-300"
              }`}
              keyboardType="numeric"
              value={form.totalAsset ? String(form.totalAsset) : ""}
              onChangeText={(text) => handleNumberChange("totalAsset", text)}
              placeholder="Enter monthly income"
            />

            {errors?.totalAsset && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.totalAsset}
              </Text>
            )}
          </View>

          {/* Monthly Expenses */}
          <View ref={registerField("totalLiabilities")} collapsable={false}>
            <Text className="mb-1 font-medium">
              Monthly Expenses (मासिक खर्च) *
            </Text>

            <TextInput
              className={`border rounded-lg px-3 py-2 ${
                errors?.totalLiabilities ? "border-red-500" : "border-gray-300"
              }`}
              keyboardType="numeric"
              value={form.totalLiabilities ? String(form.totalLiabilities) : ""}
              onChangeText={(text) =>
                handleNumberChange("totalLiabilities", text)
              }
              placeholder="Enter monthly expenses"
            />

            {errors?.totalLiabilities && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.totalLiabilities}
              </Text>
            )}
          </View>

          {/* Monthly Saving */}
          <View>
            <Text className="mb-1 font-medium">Monthly Saving (मासिक बचत)</Text>

            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
              value={calculatedNetWorth.toString()}
              editable={false}
            />
          </View>

          {/* Source of Income */}
          <View ref={registerField("soiSalary")} collapsable={false}>
            <Text className="font-semibold mt-4">
              Source of Income (आम्दानीको स्रोत) *
            </Text>

            {incomeOptions.map((item) => (
              <View
                key={item.key}
                className="flex-row justify-between items-center py-2"
              >
                <Text>{item.label}</Text>

                <Switch
                  value={Boolean(form[item.key])}
                  onValueChange={(val) => updateField(item.key, val)}
                />
              </View>
            ))}

            {errors?.soiSalary && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.soiSalary}
              </Text>
            )}
          </View>
        </>
      )}
    </View>
  );
});
