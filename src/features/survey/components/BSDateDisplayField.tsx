import React, { useEffect, useRef, useState } from "react";
import { TextInputField } from "./TextInputField";
import {
  displayBSDate,
  formatDayFirstDate,
  storeBSDate,
} from "../utils/bsDateDisplay";

type Props = Omit<React.ComponentProps<typeof TextInputField>, "keyboardType">;

export function BSDateDisplayField({ value, onChange, ...props }: Props) {
  const [text, setText] = useState(() => displayBSDate(value));
  const lastEmitted = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (value !== lastEmitted.current) setText(displayBSDate(value));
  }, [value]);
  return (
    <TextInputField
      {...props}
      value={text}
      keyboardType="number-pad"
      placeholder={
        props.readonly
          ? "Auto-calculated / स्वचालित गणना"
          : "DD/MM/YYYY (BS / वि.सं.)"
      }
      onChange={(input) => {
        const formatted = formatDayFirstDate(input ?? "");
        setText(formatted);
        const stored = storeBSDate(formatted);
        lastEmitted.current = stored;
        onChange(stored);
      }}
    />
  );
}
