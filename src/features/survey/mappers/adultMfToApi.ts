export function mapAdultMfToApi(a: Record<string, any>) {
  for (const key of ["adultMfBpMeasuredByNhf", "adultMfSugarMeasuredByNhf"]) {
    if (a[key] !== "Y" && a[key] !== "N")
      throw new Error(
        "Open Adult Health and confirm whether NHF measured blood pressure and blood sugar before syncing.",
      );
  }
  if (a.adultMfBpMeasuredByNhf === "Y" && !a.adultMfQ3)
    throw new Error("Enter the NHF blood-pressure measurement before syncing.");
  if (a.adultMfSugarMeasuredByNhf === "Y" && !a.adultMfQ4)
    throw new Error("Enter the NHF blood-sugar measurement before syncing.");
  const q1: string[] = a.adultMfQ1 || [];
  // Keep the local answer key so previously saved surveys can still sync.
  let habits = a.adultMfQ5;
  if (typeof habits === "string") {
    try {
      habits = JSON.parse(habits);
    } catch {
      habits = [];
    }
  }
  const selectedHabits = Array.isArray(habits) ? habits : [];

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
  if (a.adultMfBpMeasuredByNhf === "Y" && a.adultMfQ3) {
    result.adultMfQ3 = a.adultMfQ3;
  }

  // ---------- Glucose ----------
  if (a.adultMfSugarMeasuredByNhf === "Y" && a.adultMfQ4) {
    result.adultMfQ4 = a.adultMfQ4;
  }

  const referralTypes = [
    "health_facility",
    "hospital",
    "polyclinic",
    "pharmacy",
    "other",
  ];
  const referralType = a.adultMfReferralFacilityType;
  const hasReferral = referralTypes.includes(referralType);

  referralTypes.forEach((type, index) => {
    result[`adultMfQ5Ans${index + 1}`] = hasReferral
      ? referralType === type ? "Y" : "N"
      : "";
  });
  result.adultMfQ5Ans5Others = "";

  result.adultMfQ6Ans1 = selectedHabits.includes("S") ? "S" : "";
  result.adultMfQ6Ans2 = selectedHabits.includes("A") ? "A" : "";
  result.adultMfQ6Ans3 = selectedHabits.includes("E") ? "E" : "";
  result.adultMfQ6Ans4 = selectedHabits.includes("D") ? "D" : "";

  return result;
}
