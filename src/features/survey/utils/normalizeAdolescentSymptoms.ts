/** Carry forward legacy checked symptoms; unchecked never implies explicit No. */
function normalizeSymptoms(
  answers: Record<string, any>,
  legacyKey: string,
): Record<string, any> {
  const result = { ...answers };
  let legacy: unknown = answers[legacyKey];
  if (typeof legacy === "string") {
    try {
      legacy = JSON.parse(legacy);
    } catch {
      legacy = [];
    }
  }
  if (Array.isArray(legacy)) {
    for (let i = 1; i <= 5; i++) {
      const key = `${legacyKey}Ans${i}`;
      if (result[key] == null && legacy.includes(String(i))) result[key] = "Y";
    }
  }
  return result;
}

export function normalizeMarriedAdolescentSymptoms(
  answers: Record<string, any>,
) {
  return normalizeSymptoms(answers, "feAdolescentMaQ12");
}

export function normalizeUnmarriedAdolescentSymptoms(
  answers: Record<string, any>,
) {
  return normalizeSymptoms(answers, "feAdolescentUnQ8");
}

export function normalizeMaleAdolescentSymptoms(answers: Record<string, any>) {
  return normalizeSymptoms(answers, "maAdolescentMaQ3");
}
