import React, { useEffect } from "react";
import { View, Text, TextInput, Switch } from "react-native";
import { MemberFormState } from "../../models/MemberFormState";

interface Props {
  form: MemberFormState;
  updateField: <K extends keyof MemberFormState>(
    key: K,
    value: MemberFormState[K],
  ) => void;
  errors?: Record<string, string>;
}

export function FinancialStep({ form, updateField, errors }: Props) {
  // Auto-calculate net worth in UI
  useEffect(() => {
    const net = (form.totalAsset || 0) - (form.totalLiabilities || 0);
    if (net !== form.netWorth) {
      updateField("netWorth", net);
    }
  }, [form.netWorth, form.totalAsset, form.totalLiabilities, updateField]);

  const incomeOptions = [
    { key: "soiSalary", label: "Salary / तलब" },
    { key: "soiBusIncome", label: "Business / व्यवसाय" },
    { key: "soiAgriculture", label: "Agriculture / कृषि" },
    { key: "soiReturnfrmInvest", label: "Investment Return / लगानी आम्दानी" },
    { key: "soiInheritance", label: "Inheritance / पैतृक" },
    { key: "soiRemittance", label: "Remittance / रेमिटेन्स" },
    { key: "soiOthers", label: "Others / अन्य" },
  ] as const;

  return (
    <View className="space-y-4">
      {/* Total Asset */}
      <View>
        <Text className="mb-1 font-medium">Total Asset (कुल सम्पत्ति) *</Text>
        <TextInput
          className="border rounded-lg px-3 py-2"
          keyboardType="numeric"
          value={form.totalAsset?.toString()}
          onChangeText={(text) =>
            updateField("totalAsset", Number(text.replace(/\D/g, "")))
          }
          placeholder="Enter total asset"
        />
      </View>
      {errors?.totalAsset && (
        <Text className="text-red-500 text-xs">{errors.totalAsset}</Text>
      )}

      {/* Total Liabilities */}
      <View>
        <Text className="mb-1 font-medium">
          Total Liabilities (कुल दायित्व) *
        </Text>
        <TextInput
          className="border rounded-lg px-3 py-2"
          keyboardType="numeric"
          value={form.totalLiabilities?.toString()}
          onChangeText={(text) =>
            updateField("totalLiabilities", Number(text.replace(/\D/g, "")))
          }
          placeholder="Enter total liabilities"
        />
      </View>
      {errors?.totalLiabilities && (
        <Text className="text-red-500 text-xs">{errors.totalLiabilities}</Text>
      )}

      {/* Net Worth (Read Only) */}
      <View>
        <Text className="mb-1 font-medium">
          Net Worth (कुल सम्पत्ति - दायित्व)
        </Text>
        <TextInput
          className="border rounded-lg px-3 py-2 bg-gray-100"
          value={form.netWorth?.toString()}
          editable={false}
        />
      </View>

      {/* Source of Income */}
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
            value={form[item.key]}
            onValueChange={(val) => updateField(item.key, val)}
          />
        </View>
      ))}

      {errors?.soiSalary && (
        <Text className="text-red-500 text-xs">{errors.soiSalary}</Text>
      )}
    </View>
  );
}
