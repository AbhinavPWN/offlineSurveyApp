export function mapFeAdolescentUnToApi(a: Record<string, any>) {
  const q3 = a.feAdolescentUnQ3;
  const q8 = a.feAdolescentUnQ8 || [];
  const q9 = a.feAdolescentUnQ9;
  const q10 = a.feAdolescentUnQ10 || [];

  const hasQ8Selection = q8.length > 0;

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

  // ---------- CHECKBOX (SAFE APPROACH: ALWAYS SEND Y/N) ----------
  result.feAdolescentUnQ8Ans1 = q8.includes("1") ? "Y" : "N";
  result.feAdolescentUnQ8Ans2 = q8.includes("2") ? "Y" : "N";
  result.feAdolescentUnQ8Ans3 = q8.includes("3") ? "Y" : "N";
  result.feAdolescentUnQ8Ans4 = q8.includes("4") ? "Y" : "N";
  result.feAdolescentUnQ8Ans5 = q8.includes("5") ? "Y" : "N";

  // ---------- ONLY if Q8 has selection ----------
  if (hasQ8Selection) {
    result.feAdolescentUnQ9 = q9 ?? "N";

    // ---------- ONLY if Q9 = N ----------
    if (q9 === "N") {
      result.feAdolescentUnQ10Ans1 = q10.includes("1") ? "Y" : "N";
      result.feAdolescentUnQ10Ans2 = q10.includes("2") ? "Y" : "N";
      result.feAdolescentUnQ10Ans3 = q10.includes("3") ? "Y" : "N";
      result.feAdolescentUnQ10Ans4 = q10.includes("4") ? "Y" : "N";
      result.feAdolescentUnQ10Ans5 = q10.includes("5") ? "Y" : "N";
    }
  }

  return result;
}
