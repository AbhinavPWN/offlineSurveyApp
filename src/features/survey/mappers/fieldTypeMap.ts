// src/features/survey/mappers/fieldTypeMap.ts

export type FieldType = "checkbox" | "select" | "text";

export const fieldTypeMap: Record<string, FieldType> = {
  // =========================
  // NEONATE
  // =========================
  neonateQ1: "select",
  neonateQ2: "select",
  neonateQ3: "select",
  neonateQ4: "select",
  neonateQ5Ans1: "checkbox",
  neonateQ5Ans2: "checkbox",
  neonateQ5Ans3: "checkbox",
  neonateQ5Ans4: "checkbox",
  neonateQ5Ans5: "checkbox",
  neonateQ6: "select",
  neonateQ7: "select",
  neonateQ8: "select",
  neonateQ9: "select",
  neonateQ9Others: "text",
  neonateQ10: "select",

  // =========================
  // INFANT
  // =========================
  infantQ1: "select",
  infantQ2Ans1: "select",
  infantQ2Ans2: "select",
  infantQ2Ans3: "select",
  infantQ2Ans4: "select",
  infantQ2Ans5: "select",
  infantQ7: "select",
  infantQ8: "select",

  // =========================
  // CHILDREN
  // =========================
  childrenQ1: "select",
  childrenQ2: "select",
  childrenQ3: "select",
  childrenQ4: "select",
  childrenQ5: "select",

  // =========================
  // FEMALE ADOLESCENT UNMARRIED
  // =========================
  feAdolescentUnQ1: "select",
  feAdolescentUnQ2: "select",
  feAdolescentUnQ3: "select",
  feAdolescentUnQ4: "select",
  feAdolescentUnQ5: "select",
  feAdolescentUnQ6: "select",
  feAdolescentUnQ7: "select",
  feAdolescentUnQ8Ans1: "checkbox",
  feAdolescentUnQ8Ans2: "checkbox",
  feAdolescentUnQ8Ans3: "checkbox",
  feAdolescentUnQ8Ans4: "checkbox",
  feAdolescentUnQ8Ans5: "checkbox",
  feAdolescentUnQ9: "select",
  feAdolescentUnQ10Ans1: "checkbox",
  feAdolescentUnQ10Ans2: "checkbox",
  feAdolescentUnQ10Ans3: "checkbox",
  feAdolescentUnQ10Ans4: "checkbox",
  feAdolescentUnQ10Ans5: "checkbox",

  // =========================
  // FEMALE ADOLESCENT MARRIED
  // =========================
  feAdolescentMaQ1: "select",
  feAdolescentMaQ2: "select",
  feAdolescentMaQ3: "select",
  feAdolescentMaQ4: "select",
  feAdolescentMaQ5: "select",
  feAdolescentMaQ6: "select",
  feAdolescentMaQ7: "select",
  feAdolescentMaQ8: "select",
  feAdolescentMaQ9: "select",
  feAdolescentMaQ10: "select",
  feAdolescentMaQ11: "text",
  feAdolescentMaQ12Ans1: "checkbox",
  feAdolescentMaQ12Ans2: "checkbox",
  feAdolescentMaQ12Ans3: "checkbox",
  feAdolescentMaQ12Ans4: "checkbox",
  feAdolescentMaQ12Ans5: "checkbox",
  feAdolescentMaQ13: "select",

  // =========================
  // MALE ADOLESCENT MARRIED
  // =========================
  maAdolescentMaQ1: "select",
  maAdolescentMaQ2: "select",
  maAdolescentMaQ2Others: "text",
  maAdolescentMaQ3Ans1: "checkbox",
  maAdolescentMaQ3Ans2: "checkbox",
  maAdolescentMaQ3Ans3: "checkbox",
  maAdolescentMaQ3Ans4: "checkbox",
  maAdolescentMaQ3Ans5: "checkbox",
  maAdolescentMaQ4: "select",
  maAdolescentMaQ5: "select",

  // =========================
  // FEMALE REPRODUCTIVE
  // =========================
  feReproductiveQ1: "select",
  feReproductiveQ2: "select",
  feReproductiveQ3: "select",
  feReproductiveQ4: "select",
  feReproductiveQ5: "select",
  feReproductiveQ6: "select",
  feReproductiveQ7: "select",
  feReproductiveQ8: "select",
  feReproductiveQ9: "select",
  feReproductiveQ10Ans1: "checkbox",
  feReproductiveQ10Ans2: "checkbox",
  feReproductiveQ10Ans3: "checkbox",
  feReproductiveQ10Ans4: "checkbox",
  feReproductiveQ10Ans5: "checkbox",
  feReproductiveQ11: "select",
  feReproductiveQ12Ans1: "checkbox",
  feReproductiveQ12Ans2: "checkbox",
  feReproductiveQ12Ans3: "checkbox",
  feReproductiveQ12Ans4: "checkbox",
  feReproductiveQ13: "select",
  feReproductiveQ13Others: "text",

  // =========================
  // PREGNANT WOMAN
  // =========================
  pregnantWomanQ1: "text",
  pregnantWomanQ2: "text",
  pregnantWomanQ3: "select",
  pregnantWomanQ4Ans1: "checkbox",
  pregnantWomanQ4Ans2: "checkbox",
  pregnantWomanQ4Ans3: "checkbox",
  pregnantWomanQ4Ans4: "checkbox",
  pregnantWomanQ4Ans5: "checkbox",
  pregnantWomanQ4Ans6: "checkbox",
  pregnantWomanQ4Ans7: "checkbox",
  pregnantWomanQ4Ans7Others: "text",
  pregnantWomanQ5: "select",
  pregnantWomanQ6: "text",
  pregnantWomanQ7: "text",
  pregnantWomanQ8: "text",
  pregnantWomanQ9: "select",
  pregnantWomanQ10: "text",
  pregnantWomanQ11: "text",
  pregnantWomanQ12: "text",
  pregnantWomanQ13: "select",

  // =========================
  // POSTPARTUM WOMAN
  // =========================
  postpartumWoQ1: "text",
  postpartumWoQ2: "select",
  postpartumWoQ3: "select",
  postpartumWoQ4: "select",
  postpartumWoQ5: "select",
  postpartumWoQ6: "select",
  postpartumWoQ6Others: "text",
  postpartumWoQ7: "select",
  postpartumWoQ8: "select",
  postpartumWoQ9: "text",
  postpartumWoQ10: "select",
  postpartumWoQ11: "select",
  postpartumWoQ11Others: "text",
  postpartumWoQ12: "text",
  postpartumWoQ13: "text",
  postpartumWoQ14: "select",

  // =========================
  // ADULT MF
  // =========================
  adultMfQ1Ans1: "checkbox",
  adultMfQ1Ans2: "checkbox",
  adultMfQ1Ans3: "checkbox",
  adultMfQ1Ans4: "checkbox",
  adultMfQ1Ans5: "checkbox",
  adultMfQ1Ans6: "checkbox",
  adultMfQ1Ans7: "checkbox",
  adultMfQ1Ans8: "checkbox",
  adultMfQ1Ans9: "checkbox",
  adultMfQ1Ans10: "checkbox",
  adultMfQ1Ans11: "checkbox",
  adultMfQ1Ans11Others: "text",
  adultMfQ2: "select",
  adultMfQ3: "text",
  adultMfQ4: "text",
  adultMfQ5: "select",
};
