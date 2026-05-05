export function mapAdultMfToApi(a: Record<string, any>) {
  const q1 = a.adultMfQ1 || [];

  const hasQ1Selection = q1.length > 0;

  const result: Record<string, any> = {};

  // ---------- CHECKBOX Q1 (ALWAYS SEND FULL SET) ----------
  result.adultMfQ1Ans1 = q1.includes("H") ? "Y" : "N";
  result.adultMfQ1Ans2 = q1.includes("D") ? "Y" : "N";
  result.adultMfQ1Ans3 = q1.includes("E") ? "Y" : "N";
  result.adultMfQ1Ans4 = q1.includes("A") ? "Y" : "N";
  result.adultMfQ1Ans5 = q1.includes("T") ? "Y" : "N";
  result.adultMfQ1Ans6 = q1.includes("C") ? "Y" : "N";
  result.adultMfQ1Ans7 = q1.includes("S") ? "Y" : "N";
  result.adultMfQ1Ans8 = q1.includes("U") ? "Y" : "N";
  result.adultMfQ1Ans9 = q1.includes("K") ? "Y" : "N";
  result.adultMfQ1Ans10 = q1.includes("L") ? "Y" : "N";
  result.adultMfQ1Ans11 = q1.includes("O") ? "Y" : "N";

  // ---------- ONLY if Others selected ----------
  if (q1.includes("O")) {
    result.adultMfQ1Ans11Others = a.adultMfQ1Others ?? "";
  }

  // ---------- Q2 ONLY if any Q1 selected ----------
  if (hasQ1Selection) {
    result.adultMfQ2 = a.adultMfQ2 ?? "N";
  }

  // ---------- OPTIONAL FIELDS ----------
  if (a.adultMfQ3) {
    result.adultMfQ3 = a.adultMfQ3;
  }

  if (a.adultMfQ4) {
    result.adultMfQ4 = a.adultMfQ4;
  }

  if (a.adultMfQ5) {
    result.adultMfQ5 = a.adultMfQ5;
  }

  return result;
}
