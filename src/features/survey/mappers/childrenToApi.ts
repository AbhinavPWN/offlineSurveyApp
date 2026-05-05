export function mapChildrenToApi(a: Record<string, any>) {
  const q4 = a.childrenQ4;

  const result: Record<string, any> = {
    // ---------- Always ----------
    childrenQ1: a.childrenQ1 ?? "N",
    childrenQ2: a.childrenQ2 ?? "N",
    childrenQ3: a.childrenQ3 ?? "N",
    childrenQ4: q4 ?? "N",
  };

  //  ONLY include if visible
  if (q4 === "Y") {
    result.childrenQ5 = a.childrenQ5 ?? "N";
  }

  return result;
}
