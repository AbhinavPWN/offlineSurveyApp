import { normalizePostpartumComplications } from "../utils/normalizePostpartumComplications";

export function mapPostpartumWoToApi(a: Record<string, any>) {
  for (const key of [
    "postpartumWoBpMeasuredByNhf",
    "postpartumWoSugarMeasuredByNhf",
  ]) {
    if (a[key] !== "Y" && a[key] !== "N")
      throw new Error(
        "Open Postpartum Care and confirm whether NHF measured blood pressure and blood sugar before syncing.",
      );
  }
  if (a.postpartumWoBpMeasuredByNhf === "Y" && !a.postpartumWoQ12)
    throw new Error("Enter the NHF blood-pressure measurement before syncing.");
  if (a.postpartumWoSugarMeasuredByNhf === "Y" && !a.postpartumWoQ13)
    throw new Error("Enter the NHF blood-sugar measurement before syncing.");
  const q5 = a.postpartumWoQ5;
  const q6 = a.postpartumWoQ6;
  const q8 = a.postpartumWoQ8;
  const q10 = a.postpartumWoQ10;
  const q11 = a.postpartumWoQ11;
  const complications = normalizePostpartumComplications(q11);

  const result: Record<string, any> = {
    postpartumWoQ1: a.postpartumWoQ1 ?? "",
    postpartumWoQ2: a.postpartumWoQ2 ?? "",
    postpartumWoQ3: a.postpartumWoQ3 ?? "",

    postpartumWoQ4: a.postpartumWoQ4 ?? "",
    postpartumWoQ5: q5 ?? "",

    // postpartumWoQ6: q5 === "Y" ? (q6 ?? "") : "",

    postpartumWoQ7: a.postpartumWoQ7 ?? "",
    postpartumWoQ8: a.postpartumWoQ7 === "L" ? (q8 ?? "") : "",

    // postpartumWoQ9: q8 === "Y" ? (a.postpartumWoQ9 ?? "") : "",

    postpartumWoQ10: q10 ?? "",

    // postpartumWoQ11: q10 === "Y" ? (q11 ?? "") : "",

    postpartumWoQ12:
      a.postpartumWoBpMeasuredByNhf === "Y" ? (a.postpartumWoQ12 ?? "") : "",
    postpartumWoQ13:
      a.postpartumWoSugarMeasuredByNhf === "Y" ? (a.postpartumWoQ13 ?? "") : "",

    postpartumWoQ14: a.postpartumWoQ14 ?? "",
  };

  if (q5 === "Y") {
    result.postpartumWoQ6 = q6 ?? "";
  }

  if (a.postpartumWoQ7 === "L" && q8 === "Y") {
    result.postpartumWoQ9 = a.postpartumWoQ9 ?? "";
  }

  if (q10 === "Y") {
    result.postpartumWoQ11 = complications.includes("O")
      ? "O"
      : complications.length === 1 && complications[0] === q11
        ? q11
        : "";
    if (complications.length > 0) {
      result.postpartumWoQ11Ans1 = complications.includes("E") ? "Y" : "N";
      result.postpartumWoQ11Ans2 = complications.includes("C") ? "Y" : "N";
      result.postpartumWoQ11Ans3 = complications.includes("F") ? "Y" : "N";
    }
  }

  // ✅ ADD OTHERS ONLY WHEN VALID
  if (q5 === "Y" && q6 === "O") {
    result.postpartumWoQ6Others = a.postpartumWoQ6Others ?? "";
  }

  if (q10 === "Y" && complications.includes("O")) {
    result.postpartumWoQ11Others = a.postpartumWoQ11Others ?? "";
  }

  return result;
}
