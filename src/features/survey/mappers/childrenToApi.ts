export function mapChildrenToApi(a: Record<string, any>) {
  const q4 = a.childrenQ4;

  const result: Record<string, any> = {
    // ---------- Always ----------
    childrenQ1: a.childrenQ1 ?? "",
    childrenQ2: a.childrenQ2 ?? "N",
    childrenQ3: a.childrenQ3 ?? "N",
    childrenQ4: q4 ?? "N",
  };

  for (const key of ["childrenQ6Ans1", "childrenQ6Ans2", "childrenQ6Ans3"]) {
    const answer = a[key];
    result[key] = answer === "Y" || answer === "N" ? answer : "";
  }

  //  ONLY include if visible
  if (q4 === "Y") {
    result.childrenQ5 = a.childrenQ5 ?? "N";
  }

  return result;
}
