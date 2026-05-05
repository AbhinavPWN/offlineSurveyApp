export function mapNeonateToApi(a: Record<string, any>) {
  const q4 = a.neonateQ4;
  const q5 = a.neonateQ5 || [];
  const q8 = a.neonateQ8;
  const q9 = a.neonateQ9;

  const result: Record<string, any> = {
    neonateQ1: a.neonateQ1 ?? "",
    neonateQ2: a.neonateQ2 ?? "",
    neonateQ3: a.neonateQ3 ?? "",
    neonateQ4: q4 ?? "",
    neonateQ6: a.neonateQ6 ?? "",
    neonateQ7: a.neonateQ7 ?? "",
    neonateQ8: q8 ?? "",
    neonateQ10: a.neonateQ10 ?? "",
  };

  // ✅ ONLY include Q5 if visible
  if (q4 === "Y") {
    result.neonateQ5Ans1 = q5.includes("1") ? "Y" : "N";
    result.neonateQ5Ans2 = q5.includes("2") ? "Y" : "N";
    result.neonateQ5Ans3 = q5.includes("3") ? "Y" : "N";
    result.neonateQ5Ans4 = q5.includes("4") ? "Y" : "N";
    result.neonateQ5Ans5 = q5.includes("5") ? "Y" : "N";
  }

  // ✅ ONLY include Q9 if visible
  if (q8 === "Y") {
    result.neonateQ9 = q9 ?? "";

    if (q9 === "6") {
      result.neonateQ9Others = a.neonateQ9Others ?? "";
    }
  }

  return result;
}
