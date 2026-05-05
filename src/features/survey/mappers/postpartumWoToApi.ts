export function mapPostpartumWoToApi(a: Record<string, any>) {
  const q5 = a.postpartumWoQ5;
  const q6 = a.postpartumWoQ6;
  const q8 = a.postpartumWoQ8;
  const q10 = a.postpartumWoQ10;
  const q11 = a.postpartumWoQ11;

  const result: Record<string, any> = {
    postpartumWoQ1: a.postpartumWoQ1 ?? "",
    postpartumWoQ2: a.postpartumWoQ2 ?? "",
    postpartumWoQ3: a.postpartumWoQ3 ?? "",

    postpartumWoQ4: a.postpartumWoQ4 ?? "",
    postpartumWoQ5: q5 ?? "",

    // postpartumWoQ6: q5 === "Y" ? (q6 ?? "") : "",

    postpartumWoQ7: a.postpartumWoQ7 ?? "",
    postpartumWoQ8: q8 ?? "",

    // postpartumWoQ9: q8 === "Y" ? (a.postpartumWoQ9 ?? "") : "",

    postpartumWoQ10: q10 ?? "",

    // postpartumWoQ11: q10 === "Y" ? (q11 ?? "") : "",

    postpartumWoQ12: a.postpartumWoQ12 ?? "",
    postpartumWoQ13: a.postpartumWoQ13 ?? "",

    postpartumWoQ14: a.postpartumWoQ14 ?? "",
  };

  if (q5 === "Y") {
    result.postpartumWoQ6 = q6 ?? "";
  }

  if (q8 === "Y") {
    result.postpartumWoQ9 = a.postpartumWoQ9 ?? "";
  }

  if (q10 === "Y") {
    result.postpartumWoQ11 = q11 ?? "";
  }

  // ✅ ADD OTHERS ONLY WHEN VALID
  if (q5 === "Y" && q6 === "O") {
    result.postpartumWoQ6Others = a.postpartumWoQ6Others ?? "";
  }

  if (q10 === "Y" && q11 === "O") {
    result.postpartumWoQ11Others = a.postpartumWoQ11Others ?? "";
  }

  return result;
}
