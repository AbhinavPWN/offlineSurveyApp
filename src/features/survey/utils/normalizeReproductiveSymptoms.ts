/** Preserve checked legacy symptoms without interpreting an unchecked box as No. */
export function normalizeReproductiveSymptoms(answers: Record<string, any>) {
  const result = { ...answers };
  for (const [prefix, count] of [
    ["feReproductiveQ10", 5],
    ["feReproductiveQ12", 4],
  ] as const) {
    let legacy: unknown = answers[prefix];
    if (typeof legacy === "string") {
      try {
        legacy = JSON.parse(legacy);
      } catch {
        legacy = [];
      }
    }
    if (!Array.isArray(legacy)) continue;
    for (let i = 1; i <= count; i++) {
      const key = `${prefix}Ans${i}`;
      if (result[key] == null && legacy.includes(String(i))) result[key] = "Y";
    }
  }
  return result;
}
