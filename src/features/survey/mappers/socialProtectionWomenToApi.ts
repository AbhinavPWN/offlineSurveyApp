export function mapSocialProtectionWomenToApi(a: Record<string, any>) {
  let q2: string[] = [];

  const rawQ2 = a.socialProtectionWomenQ2;

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

  const result: Record<string, any> = {};

  result.adultFQ1 = a.socialProtectionWomenQ1 === "Y" ? "Y" : "N";

  result.adultFQ2Ans1 = q2.includes("1") ? "Y" : "N";

  result.adultFQ2Ans2 = q2.includes("2") ? "Y" : "N";

  result.adultFQ2Ans3 = q2.includes("3") ? "Y" : "N";

  result.adultFQ2Ans4 = q2.includes("4") ? "Y" : "N";

  result.adultFQ2Ans5 = q2.includes("5") ? "Y" : "N";

  result.adultFQ2Ans6 = q2.includes("6") ? "Y" : "N";

  result.adultFQ2Ans7 = q2.includes("7") ? "Y" : "N";

  result.adultFQ2Ans8 = q2.includes("8") ? "Y" : "N";

  result.adultFQ2Ans9 = q2.includes("9") ? "Y" : "N";

  result.adultFQ2Ans10 = q2.includes("10") ? "Y" : "N";

  result.adultFQ2Others = q2.includes("10")
    ? (a.socialProtectionWomenQ2Others?.trim() ?? "")
    : "";

  result.adultFQ3 =
    a.socialProtectionWomenQ1 === "Y" ? (a.socialProtectionWomenQ3 ?? "") : "";

  return result;
}
