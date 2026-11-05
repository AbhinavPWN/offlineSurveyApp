export function mapInfantToApi(a: Record<string, any>) {
  const vaccinations = a.infantQ2 || [];

  return {
    // ---------- Feeding ----------
    infantQ1: a.infantQ1 ?? "",

    // ---------- Vaccination History ----------
    infantQ2Ans1: vaccinations.includes("1") ? "Y" : "N",
    infantQ2Ans2: vaccinations.includes("2") ? "Y" : "N",
    infantQ2Ans3: vaccinations.includes("3") ? "Y" : "N",
    infantQ2Ans4: vaccinations.includes("4") ? "Y" : "N",
    infantQ2Ans5: vaccinations.includes("5") ? "Y" : "N",

    // ---------- Latest Vaccination ----------
    infantQ3: a.infantQ3 ?? "",
    infantQ4: a.infantQ4 ?? "",

    // ---------- Diarrhea ----------
    infantQ5: a.infantQ5 ?? "",

    // Displayed Q4 is independent of the diarrhoea answer in the approved wording.
    infantQ6: a.infantQ6 ?? "",
  };
}
