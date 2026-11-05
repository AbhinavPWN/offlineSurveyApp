export function normalizePostpartumComplications(value: unknown): string[] {
  if (typeof value === "string" && value.startsWith("[")) {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }

  const selections = Array.isArray(value) ? value : [value];
  return selections.filter((code) => ["E", "C", "F", "O"].includes(code));
}
