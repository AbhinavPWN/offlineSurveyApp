export function mapInfantToApi(a: Record<string, any>) {
  const q7 = a.infantQ7;

  return {
    // ---------- Basic ----------
    infantQ1: a.infantQ1 ?? "N",

    // ---------- Vaccination (map directly) ----------
    infantQ2Ans1: a.infantQ2 ?? "N", // BCG
    infantQ2Ans2: a.infantQ3 ?? "N", // Penta1
    infantQ2Ans3: a.infantQ4 ?? "N", // Penta2
    infantQ2Ans4: a.infantQ5 ?? "N", // Penta3
    infantQ2Ans5: a.infantQ6 ?? "N", // PCV3

    // ---------- Health ----------
    infantQ7: q7 ?? "N",

    // ---------- Conditional ----------
    infantQ8: q7 === "Y" ? (a.infantQ8 ?? "N") : "",
  };
}
