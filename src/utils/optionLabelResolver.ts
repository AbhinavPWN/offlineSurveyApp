import { DropdownOption } from "@/src/features/member-form/models/DropdownOptions";

export function getOptionLabel(
  options: DropdownOption[],
  value: string | null | undefined,
): string {
  if (!value) return "-";

  const found = options.find((opt) => opt.value === value);
  return found?.labelEn ?? "-";
}
