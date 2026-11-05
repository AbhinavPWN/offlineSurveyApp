export function mapPregnantWomanToApi(a: Record<string, any>) {
  const hasPreviousPregnancy = a.pregnantWomanQ3 === "N";
  const q4 = hasPreviousPregnancy ? a.pregnantWomanQ4 || [] : [];
  for (const key of [
    "pregnantWomanBpMeasuredByNhf",
    "pregnantWomanSugarMeasuredByNhf",
  ]) {
    if (a[key] !== "Y" && a[key] !== "N")
      throw new Error(
        "Open the Pregnancy section and confirm whether NHF measured blood pressure and blood sugar before syncing.",
      );
  }
  if (a.pregnantWomanBpMeasuredByNhf === "Y" && !a.pregnantWomanQ11)
    throw new Error("Enter the NHF blood-pressure measurement before syncing.");
  if (a.pregnantWomanSugarMeasuredByNhf === "Y" && !a.pregnantWomanQ12)
    throw new Error("Enter the NHF blood-sugar measurement before syncing.");
  const q5 = a.pregnantWomanQ5;
  const q9 = a.pregnantWomanQ9;

  const result: Record<string, any> = {
    // ---------- ALWAYS ----------
    pregnantWomanQ3: a.pregnantWomanQ3 ?? "N",
    pregnantWomanQ9: q9 ?? "N",
    pregnantWomanQ13: a.pregnantWomanQ13 ?? "N",
  };

  // ---------- DATE FIELDS (ONLY IF PRESENT) ----------
  if (a.pregnantWomanQ1) {
    result.pregnantWomanQ1 = a.pregnantWomanQ1;
  }

  if (a.pregnantWomanQ2) {
    result.pregnantWomanQ2 = a.pregnantWomanQ2;
  }

  // ---------- CHECKBOX Q4 ----------
  result.pregnantWomanQ4Ans1 = q4.includes("A") ? "Y" : "N";
  result.pregnantWomanQ4Ans2 = q4.includes("S") ? "Y" : "N";
  result.pregnantWomanQ4Ans3 = q4.includes("C") ? "Y" : "N";
  result.pregnantWomanQ4Ans4 = q4.includes("E") ? "Y" : "N";
  result.pregnantWomanQ4Ans5 = q4.includes("AP") ? "Y" : "N";
  result.pregnantWomanQ4Ans6 = q4.includes("H") ? "Y" : "N";
  result.pregnantWomanQ4Ans7 = q4.includes("D") ? "Y" : "N";

  // ✅ ONLY include Others if selected
  if (q4.includes("O")) {
    result.pregnantWomanQ4Ans7Others = a.pregnantWomanQ4Others ?? "";
  }

  if (hasPreviousPregnancy) result.pregnantWomanQ5 = q5 ?? "N";

  // ---------- ANC VISIT ----------
  if (hasPreviousPregnancy && q5 === "Y") {
    result.pregnantWomanQ6 = a.pregnantWomanQ6 ?? "";
  }

  // ---------- ALWAYS SAFE NUMERIC ----------
  if (a.pregnantWomanQ7 !== undefined) {
    result.pregnantWomanQ7 = a.pregnantWomanQ7;
  }

  if (a.pregnantWomanQ8 !== undefined) {
    result.pregnantWomanQ8 = a.pregnantWomanQ8;
  }

  // ---------- TT DOSE ----------
  if (q9 === "Y") {
    result.pregnantWomanQ10 = a.pregnantWomanQ10 ?? "";
  }

  // ---------- OPTIONAL HEALTH FIELDS ----------
  if (a.pregnantWomanBpMeasuredByNhf === "Y" && a.pregnantWomanQ11) {
    result.pregnantWomanQ11 = a.pregnantWomanQ11;
  }

  if (a.pregnantWomanSugarMeasuredByNhf === "Y" && a.pregnantWomanQ12) {
    result.pregnantWomanQ12 = a.pregnantWomanQ12;
  }

  return result;
}
