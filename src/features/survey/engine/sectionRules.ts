import { SurveySectionKey, MemberSurveyProfile } from "./surveyClassifier";

type RuleContext = {
  sections: SurveySectionKey[];
  answers: Record<string, any>;
  profile: MemberSurveyProfile;
};

type SectionRule = (ctx: RuleContext) => SurveySectionKey[];

export const SECTION_RULES: SectionRule[] = [
  //  CONDITION 8 → 9 (Reproductive → Pregnant)
  (ctx) => {
    if (ctx.answers.feReproductiveQ3 === "Y") {
      return ["pregnantWoman"];
    }
    return [];
  },
];

export function applySectionRules(
  baseSections: SurveySectionKey[],
  answers: Record<string, any>,
  profile: MemberSurveyProfile,
): SurveySectionKey[] {
  let result = [...baseSections];

  for (const rule of SECTION_RULES) {
    const additions = rule({ sections: result, answers, profile });

    for (const section of additions) {
      if (!result.includes(section)) {
        result.push(section);
      }
    }
  }

  return result;
}
