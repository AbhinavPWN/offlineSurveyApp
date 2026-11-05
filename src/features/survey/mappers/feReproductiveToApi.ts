import { normalizeReproductiveSymptoms } from "../utils/normalizeReproductiveSymptoms";

export function mapFeReproductiveToApi(raw: Record<string, any>) {
  const a = normalizeReproductiveSymptoms(raw);
  const result: Record<string, any> = {
    feReproductiveQ1: a.feReproductiveQ1 ?? "N",
  };
  if (a.feReproductiveQ1 === "N") {
    result.feReproductiveQ2 = a.feReproductiveQ2 ?? "N";
    result.feReproductiveQ3 = a.feReproductiveQ3 ?? "N";
  }
  // Pregnancy answers belong to the existing Pregnancy section.
  if (a.feReproductiveQ3 === "Y") return result;

  result.feReproductiveQ4 = a.feReproductiveQ4 ?? "";
  if (a.feReproductiveQ4 === "D")
    result.feReproductiveQ5 = a.feReproductiveQ5 ?? "";
  if (a.feReproductiveQ4 === "R") {
    result.feReproductiveQ6 = a.feReproductiveQ6 ?? "";
    result.feReproductiveQ7 = a.feReproductiveQ7 ?? "";
  }
  result.feReproductiveQ8 = a.feReproductiveQ8 ?? "N";
  if (a.feReproductiveQ8 === "Y")
    result.feReproductiveQ9 = a.feReproductiveQ9 ?? "";

  for (const [prefix, count] of [
    ["feReproductiveQ10", 5],
    ["feReproductiveQ12", 4],
  ] as const) {
    for (let i = 1; i <= count; i++) {
      const key = `${prefix}Ans${i}`;
      if (a[key] !== "Y" && a[key] !== "N") {
        throw new Error(
          "Open the Reproductive Health section and answer Yes or No for every symptom before syncing.",
        );
      }
      result[key] = a[key];
    }
  }
  const hasSymptoms = Array.from(
    { length: 5 },
    (_, i) => a[`feReproductiveQ10Ans${i + 1}`],
  ).includes("Y");
  const hasComplications = Array.from(
    { length: 4 },
    (_, i) => a[`feReproductiveQ12Ans${i + 1}`],
  ).includes("Y");
  if (hasSymptoms) {
    if (a.feReproductiveQ11 !== "Y" && a.feReproductiveQ11 !== "N")
      throw new Error(
        "Answer the Q11 health-facility question before syncing.",
      );
    result.feReproductiveQ11 = a.feReproductiveQ11;
  }
  if (hasComplications) {
    if (a.feReproductiveQ13 !== "Y" && a.feReproductiveQ13 !== "N")
      throw new Error(
        "Answer the Q13 health-provider question before syncing.",
      );
    if (a.feReproductiveQ13 === "N" && !a.feReproductiveQ13Details?.trim())
      throw new Error("Enter the referral facility name before syncing.");
    result.feReproductiveQ13 = a.feReproductiveQ13;
    // This field records a referral facility when the answer is No.
    if (a.feReproductiveQ13 === "N")
      result.feReproductiveQ13Others = a.feReproductiveQ13Details ?? "";
  }
  return result;
}
