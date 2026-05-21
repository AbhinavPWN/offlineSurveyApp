export function mapAdultMfToApi(a: Record<string, any>) {
  const q1: string[] = a.adultMfQ1 || [];
  const q5: string[] = a.adultMfQ5 || [];

  const hasQ1Selection = q1.length > 0;

  const result: Record<string, any> = {};

  // ---------- Q1 ----------
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

  if (q1.includes("O")) {
    result.adultMfQ1Ans11Others = a.adultMfQ1Others ?? "";
  }

  // ---------- Q2 ----------
  if (hasQ1Selection) {
    result.adultMfQ2 = a.adultMfQ2 ?? "N";
  }

  // ---------- BP ----------
  if (a.adultMfQ3) {
    result.adultMfQ3 = a.adultMfQ3;
  }

  // ---------- Glucose ----------
  if (a.adultMfQ4) {
    result.adultMfQ4 = a.adultMfQ4;
  }

  // ----------  Q5 FIXED ----------
  result.adultMfQ5Ans1 = q5.includes("S") ? "S" : "";
  result.adultMfQ5Ans2 = q5.includes("A") ? "A" : "";
  result.adultMfQ5Ans3 = q5.includes("E") ? "E" : "";
  result.adultMfQ5Ans4 = q5.includes("D") ? "D" : "";

  return result;
}
