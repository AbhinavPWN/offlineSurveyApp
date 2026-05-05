export function mapFeAdolescentMaToApi(a: Record<string, any>) {
  const q7 = a.feAdolescentMaQ7;
  const q9 = a.feAdolescentMaQ9;
  const q10 = a.feAdolescentMaQ10;
  const q12 = a.feAdolescentMaQ12 || [];

  const hasQ12Selection = q12.length > 0;

  const result: Record<string, any> = {
    // ---------- ALWAYS ----------
    feAdolescentMaQ1: a.feAdolescentMaQ1 ?? "N",
    feAdolescentMaQ2: a.feAdolescentMaQ2 ?? "N",

    feAdolescentMaQ3: a.feAdolescentMaQ3 ?? "",
    feAdolescentMaQ4: a.feAdolescentMaQ4 ?? "",
    feAdolescentMaQ5: a.feAdolescentMaQ5 ?? "",
    feAdolescentMaQ6: a.feAdolescentMaQ6 ?? "",

    feAdolescentMaQ7: q7 ?? "N",
    feAdolescentMaQ9: q9 ?? "N",
  };

  // ---------- Q8 (ONLY if Q7 = Y) ----------
  if (q7 === "Y") {
    result.feAdolescentMaQ8 = a.feAdolescentMaQ8 ?? "";
  }

  // ---------- Q10 (ONLY if Q9 = Y) ----------
  if (q9 === "Y") {
    result.feAdolescentMaQ10 = q10 ?? "N";

    // ---------- Q11 (ONLY if Q10 = Y) ----------
    if (q10 === "Y") {
      result.feAdolescentMaQ11 = a.feAdolescentMaQ11 ?? "";
    }
  }

  // ---------- CHECKBOX Q12 (ALWAYS send full set) ----------
  result.feAdolescentMaQ12Ans1 = q12.includes("1") ? "Y" : "N";
  result.feAdolescentMaQ12Ans2 = q12.includes("2") ? "Y" : "N";
  result.feAdolescentMaQ12Ans3 = q12.includes("3") ? "Y" : "N";
  result.feAdolescentMaQ12Ans4 = q12.includes("4") ? "Y" : "N";
  result.feAdolescentMaQ12Ans5 = q12.includes("5") ? "Y" : "N";

  // ---------- Q13 (ONLY if any Q12 selected) ----------
  if (hasQ12Selection) {
    result.feAdolescentMaQ13 = a.feAdolescentMaQ13 ?? "N";
  }

  return result;
}
