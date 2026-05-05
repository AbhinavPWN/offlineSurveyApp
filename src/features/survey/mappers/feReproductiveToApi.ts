export function mapFeReproductiveToApi(a: Record<string, any>) {
  const q1 = a.feReproductiveQ1;
  const q8 = a.feReproductiveQ8;
  const q9 = a.feReproductiveQ9;
  const q10 = a.feReproductiveQ10 || [];
  const q12 = a.feReproductiveQ12 || [];
  const q13 = a.feReproductiveQ13;

  const hasQ10 = q10.length > 0;
  const hasQ12 = q12.length > 0;

  const result: Record<string, any> = {
    // ---------- ALWAYS ----------
    feReproductiveQ1: q1 ?? "N",
    feReproductiveQ2: a.feReproductiveQ2 ?? "N",
    feReproductiveQ3: a.feReproductiveQ3 ?? "N",
    feReproductiveQ8: q8 ?? "N",
  };

  // ---------- Q4–Q7 (ONLY if Q1 = Y) ----------
  if (q1 === "Y") {
    result.feReproductiveQ4 = a.feReproductiveQ4 ?? "";
    result.feReproductiveQ5 = a.feReproductiveQ5 ?? "";
    result.feReproductiveQ6 = a.feReproductiveQ6 ?? "";
    result.feReproductiveQ7 = a.feReproductiveQ7 ?? "";
  }

  // ---------- Q9 (ONLY if Q8 = Y) ----------
  if (q8 === "Y") {
    result.feReproductiveQ9 = q9 ?? "";
  }

  // ---------- CHECKBOX Q10 (ALWAYS SEND FULL SET) ----------
  result.feReproductiveQ10Ans1 = q10.includes("1") ? "Y" : "N";
  result.feReproductiveQ10Ans2 = q10.includes("2") ? "Y" : "N";
  result.feReproductiveQ10Ans3 = q10.includes("3") ? "Y" : "N";
  result.feReproductiveQ10Ans4 = q10.includes("4") ? "Y" : "N";
  result.feReproductiveQ10Ans5 = q10.includes("5") ? "Y" : "N";

  // ---------- Q11 (ONLY if any Q10 selected) ----------
  if (hasQ10) {
    result.feReproductiveQ11 = a.feReproductiveQ11 ?? "N";
  }

  // ---------- CHECKBOX Q12 ----------
  result.feReproductiveQ12Ans1 = q12.includes("1") ? "Y" : "N";
  result.feReproductiveQ12Ans2 = q12.includes("2") ? "Y" : "N";
  result.feReproductiveQ12Ans3 = q12.includes("3") ? "Y" : "N";
  result.feReproductiveQ12Ans4 = q12.includes("4") ? "Y" : "N";

  // ---------- Q13 (ONLY if Q12 selected) ----------
  if (hasQ12) {
    result.feReproductiveQ13 = q13 ?? "N";

    // ---------- DETAILS ONLY IF YES ----------
    if (q13 === "Y") {
      result.feReproductiveQ13Others = a.feReproductiveQ13Details ?? "";
    }
  }

  return result;
}
