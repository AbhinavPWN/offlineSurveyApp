import { normalizeMarriedAdolescentSymptoms } from "../utils/normalizeAdolescentSymptoms";

export function mapFeAdolescentMaToApi(a: Record<string, any>) {
  a = normalizeMarriedAdolescentSymptoms(a);
  const q7 = a.feAdolescentMaQ7;
  const q9 = a.feAdolescentMaQ9;
  const q10 = a.feAdolescentMaQ10;
  const symptoms = Array.from(
    { length: 5 },
    (_, i) => a[`feAdolescentMaQ12Ans${i + 1}`],
  );
  if (symptoms.some((value) => value !== "Y" && value !== "N")) {
    throw new Error(
      "Open this survey and answer Yes or No for all five Q12 symptoms before syncing.",
    );
  }
  const hasQ12Selection = symptoms.includes("Y");

  const result: Record<string, any> = {
    // ---------- ALWAYS ----------
    feAdolescentMaQ1: a.feAdolescentMaQ1 ?? "N",
    feAdolescentMaQ2: a.feAdolescentMaQ2 ?? "N",

    feAdolescentMaQ3: a.feAdolescentMaQ3 ?? "",
    feAdolescentMaQ7: q7 ?? "N",
  };

  const product = a.feAdolescentMaQ3;
  if (product === "D") result.feAdolescentMaQ4 = a.feAdolescentMaQ4 ?? "";
  if (product === "R") {
    result.feAdolescentMaQ5 = a.feAdolescentMaQ5 ?? "";
    result.feAdolescentMaQ6 = a.feAdolescentMaQ6 ?? "";
  }
  if (q7 === "N") result.feAdolescentMaQ9 = q9 ?? "N";

  // ---------- Q8 (ONLY if Q7 = Y) ----------
  if (q7 === "Y") {
    result.feAdolescentMaQ8 = a.feAdolescentMaQ8 ?? "";
  }

  // ---------- Q10 (ONLY if Q9 = Y) ----------
  if (q7 === "N" && q9 === "Y") {
    result.feAdolescentMaQ10 = q10 ?? "N";

    // ---------- Q11 (ONLY if Q10 = Y) ----------
    if (q10 === "Y") {
      result.feAdolescentMaQ11 = a.feAdolescentMaQ11 ?? "";
    }
  }

  // ---------- Q12: explicit Yes/No answers ----------
  result.feAdolescentMaQ12Ans1 = symptoms[0];
  result.feAdolescentMaQ12Ans2 = symptoms[1];
  result.feAdolescentMaQ12Ans3 = symptoms[2];
  result.feAdolescentMaQ12Ans4 = symptoms[3];
  result.feAdolescentMaQ12Ans5 = symptoms[4];

  // ---------- Q13 (ONLY if any Q12 selected) ----------
  if (hasQ12Selection) {
    result.feAdolescentMaQ13 = a.feAdolescentMaQ13 ?? "N";
  }

  return result;
}
