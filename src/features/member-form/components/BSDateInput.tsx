import React, { useEffect, useState } from "react";
import { View, Text, TextInput } from "react-native";
import {
  convertBSToADISO,
  convertADToBSISO,
} from "@/src/utils/nepaliDateUtils";

interface Props {
  label: string;
  adValue: string | null;
  onChangeAD: (adIso: string | null) => void;
}

function formatISODate(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function isValidBasicBSDate(bs: string): boolean {
  const parts = bs.split("-");
  if (parts.length !== 3) return false;

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (!year || !month || !day) return false;

  if (month < 1 || month > 12) return false;

  // Hard limit (safe upper bound)
  if (day < 1 || day > 32) return false;

  return true;
}

export const BSDateInput = React.memo(
  function BSDateInput({ label, adValue, onChangeAD }: Props) {
    const [bsValue, setBsValue] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (!adValue) {
        setBsValue("");
        return;
      }

      const bs = convertADToBSISO(adValue);
      setBsValue(bs ?? "");
    }, [adValue]);

    return (
      <View className="mb-4">
        <Text className="mb-1 font-medium">{label}</Text>

        <TextInput
          className="border rounded-lg px-3 py-2"
          keyboardType="number-pad"
          maxLength={10}
          value={bsValue}
          placeholder="YYYY-MM-DD (BS)"
          onChangeText={(text) => {
            const formatted = formatISODate(text);
            setBsValue(formatted);
            setError(null);

            if (formatted.length === 0) {
              onChangeAD(null);
              return;
            }

            if (formatted.length === 10) {
              if (!isValidBasicBSDate(formatted)) {
                setError("Invalid BS date format.");
                onChangeAD(null);
                return;
              }

              const ad = convertBSToADISO(formatted);

              if (!ad) {
                setError("Invalid BS date.");
                onChangeAD(null);
                return;
              }

              onChangeAD(ad);
            }
          }}
        />

        {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.label === nextProps.label && prevProps.adValue === nextProps.adValue,
);
