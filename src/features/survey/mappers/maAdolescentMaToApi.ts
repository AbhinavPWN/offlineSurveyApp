import { normalizeMaleAdolescentSymptoms } from "../utils/normalizeAdolescentSymptoms";

export function mapMaAdolescentMaToApi(a: Record<string, any>) {
  a = normalizeMaleAdolescentSymptoms(a);
  const q1 = a.maAdolescentMaQ1;
  const q2 = a.maAdolescentMaQ2;
  const symptoms = Array.from(
    { length: 5 },
    (_, i) => a[`maAdolescentMaQ3Ans${i + 1}`],
  );
  if (symptoms.some((value) => value !== "Y" && value !== "N")) {
    throw new Error(
      "Open this survey and answer Yes or No for all five Q3 symptoms before syncing.",
    );
  }
  const hasQ3Selection = symptoms.includes("Y");

  const result: Record<string, any> = {
    // ---------- ALWAYS ----------
    maAdolescentMaQ1: q1 ?? "N",

    // Awareness (required field → always send valid code)
    maAdolescentMaQ5: a.maAdolescentMaQ5 ?? "",
  };

  // ---------- Q2 (ONLY if Q1 = Y) ----------
  if (q1 === "Y") {
    result.maAdolescentMaQ2 = q2 ?? "";

    // ---------- Q2 Others ----------
    if (q2 === "O") {
      result.maAdolescentMaQ2Others = a.maAdolescentMaQ2Others ?? "";
    }
  }

  // ---------- Q3: explicit Yes/No answers ----------
  result.maAdolescentMaQ3Ans1 = symptoms[0];
  result.maAdolescentMaQ3Ans2 = symptoms[1];
  result.maAdolescentMaQ3Ans3 = symptoms[2];
  result.maAdolescentMaQ3Ans4 = symptoms[3];
  result.maAdolescentMaQ3Ans5 = symptoms[4];

  // ---------- Q4 (ONLY if any Q3 selected) ----------
  if (hasQ3Selection) {
    if (a.maAdolescentMaQ4 !== "Y" && a.maAdolescentMaQ4 !== "N") {
      throw new Error(
        "Open this survey and answer the Q4 health-facility question before syncing.",
      );
    }
    result.maAdolescentMaQ4 = a.maAdolescentMaQ4;
  }

  return result;
}
