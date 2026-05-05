export function mapMaAdolescentMaToApi(a: Record<string, any>) {
  const q1 = a.maAdolescentMaQ1;
  const q2 = a.maAdolescentMaQ2;
  const q3 = a.maAdolescentMaQ3 || [];

  const hasQ3Selection = q3.length > 0;

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

  // ---------- CHECKBOX Q3 (ALWAYS send full set) ----------
  result.maAdolescentMaQ3Ans1 = q3.includes("1") ? "Y" : "N";
  result.maAdolescentMaQ3Ans2 = q3.includes("2") ? "Y" : "N";
  result.maAdolescentMaQ3Ans3 = q3.includes("3") ? "Y" : "N";
  result.maAdolescentMaQ3Ans4 = q3.includes("4") ? "Y" : "N";
  result.maAdolescentMaQ3Ans5 = q3.includes("5") ? "Y" : "N";

  // ---------- Q4 (ONLY if any Q3 selected) ----------
  if (hasQ3Selection) {
    result.maAdolescentMaQ4 = a.maAdolescentMaQ4 ?? "N";
  }

  return result;
}
