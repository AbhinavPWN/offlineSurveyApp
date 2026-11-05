import { normalizeUnmarriedAdolescentSymptoms } from "../utils/normalizeAdolescentSymptoms";

export function mapFeAdolescentUnToApi(a: Record<string, any>) {
  a = normalizeUnmarriedAdolescentSymptoms(a);
  const q3 = a.feAdolescentUnQ3;
  const symptoms = Array.from(
    { length: 5 },
    (_, i) => a[`feAdolescentUnQ8Ans${i + 1}`],
  );
  if (symptoms.some((value) => value !== "Y" && value !== "N")) {
    throw new Error(
      "Open this survey and answer Yes or No for all five Q8 symptoms before syncing.",
    );
  }
  const q9 = a.feAdolescentUnQ9;
  const q10 = a.feAdolescentUnQ10 || [];

  const result: Record<string, any> = {
    // ---------- ALWAYS ----------
    feAdolescentUnQ1: a.feAdolescentUnQ1 ?? "N",
    feAdolescentUnQ2: a.feAdolescentUnQ2 ?? "N",
    feAdolescentUnQ3: q3 ?? "N",
  };

  // ---------- ONLY if menstruation started ----------
  if (q3 === "Y") {
    result.feAdolescentUnQ4 = a.feAdolescentUnQ4 ?? "";
    result.feAdolescentUnQ5 = a.feAdolescentUnQ5 ?? "";
    result.feAdolescentUnQ6 = a.feAdolescentUnQ6 ?? "";
    result.feAdolescentUnQ7 = a.feAdolescentUnQ7 ?? "";
  }

  // ---------- Q8: explicit Yes/No answers ----------
  result.feAdolescentUnQ8Ans1 = symptoms[0];
  result.feAdolescentUnQ8Ans2 = symptoms[1];
  result.feAdolescentUnQ8Ans3 = symptoms[2];
  result.feAdolescentUnQ8Ans4 = symptoms[3];
  result.feAdolescentUnQ8Ans5 = symptoms[4];

  // The approved facility question is conditional on Q3 (menstruation).
  if (q3 === "Y") {
    result.feAdolescentUnQ9 = q9 ?? "N";
  }

  // Mental-health responses are independent of facility attendance.
  result.feAdolescentUnQ10Ans1 = q10.includes("1") ? "Y" : "N";
  result.feAdolescentUnQ10Ans2 = q10.includes("2") ? "Y" : "N";
  result.feAdolescentUnQ10Ans3 = q10.includes("3") ? "Y" : "N";
  result.feAdolescentUnQ10Ans4 = q10.includes("4") ? "Y" : "N";
  result.feAdolescentUnQ10Ans5 = q10.includes("5") ? "Y" : "N";
  return result;
}
