export function mapDisableInfantToApi(a: Record<string, any>) {
  let q2: string[] = [];

  const rawQ2 = a.disableInfantQ2;

  // Handle JSON-string checkbox values
  if (Array.isArray(rawQ2)) {
    q2 = rawQ2;
  } else if (typeof rawQ2 === "string") {
    try {
      const parsed = JSON.parse(rawQ2);

      if (Array.isArray(parsed)) {
        q2 = parsed;
      }
    } catch {
      q2 = [];
    }
  }

  const hasQ2Selection = q2.length > 0;

  const result: Record<string, any> = {};

  // ---------- Q1 ----------
  result.disableInfantQ1 = a.disableInfantQ1 ?? "";

  // ---------- Q2 ----------
  result.disableInfantQ2Ans1 = q2.includes("1") ? "Y" : "N";
  result.disableInfantQ2Ans2 = q2.includes("2") ? "Y" : "N";
  result.disableInfantQ2Ans3 = q2.includes("3") ? "Y" : "N";
  result.disableInfantQ2Ans4 = q2.includes("4") ? "Y" : "N";
  result.disableInfantQ2Ans5 = q2.includes("5") ? "Y" : "N";
  result.disableInfantQ2Ans6 = q2.includes("6") ? "Y" : "N";
  result.disableInfantQ2Ans7 = q2.includes("7") ? "Y" : "N";
  result.disableInfantQ2Ans8 = q2.includes("8") ? "Y" : "N";
  result.disableInfantQ2Ans9 = q2.includes("9") ? "Y" : "N";
  result.disableInfantQ2Ans10 = q2.includes("10") ? "Y" : "N";

  // ---------- Other ----------
  if (q2.includes("10")) {
    result.disableInfantQ2Others = a.disableInfantQ2Others?.trim() ?? "";
  }

  // ---------- Q3 ----------
  if (hasQ2Selection) {
    result.disableInfantQ3 = a.disableInfantQ3 ?? "";
  }

  console.log("[DISABILITY][INPUT]", {
    q1: a.disableInfantQ1,
    q2: a.disableInfantQ2,
    q3: a.disableInfantQ3,
  });

  console.log("[DISABILITY][OUTPUT]", result);

  return result;
}
