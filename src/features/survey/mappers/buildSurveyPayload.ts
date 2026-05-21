// src/features/survey/mappers/buildSurveyPayload.ts

import { emptySurveyPayload } from "./emptySurveyPayload";

import { mapNeonateToApi } from "./neonateToApi";
import { mapInfantToApi } from "./infantToApi";
import { mapChildrenToApi } from "./childrenToApi";
import { mapFeAdolescentUnToApi } from "./feAdolescentUnToApi";
import { mapFeAdolescentMaToApi } from "./feAdolescentMaToApi";
import { mapMaAdolescentMaToApi } from "./maAdolescentMaToApi";
import { mapFeReproductiveToApi } from "./feReproductiveToApi";
import { mapPregnantWomanToApi } from "./pregnantWomanToApi";
import { mapPostpartumWoToApi } from "./postpartumWoToApi";
import { mapAdultMfToApi } from "./adultMfToApi";
import { mapSocialProtectionWomenToApi } from "./socialProtectionWomenToApi";
import { mapDisableInfantToApi } from "./disableInfantToApi";

import { SurveySectionKey } from "../engine/surveyClassifier";

export function buildSurveyPayload(
  answers: Record<string, any>,
  sections: SurveySectionKey[],
) {
  // Step 1: base payload
  // let payload = { ...emptySurveyPayload };
  let payload: Record<string, any> = { ...emptySurveyPayload };

  // Step 2: apply only active sections
  for (const section of sections) {
    console.log("[PAYLOAD][SECTION]", section);
    switch (section) {
      case "neonate":
        payload = { ...payload, ...mapNeonateToApi(answers) };
        break;

      case "infant":
        payload = { ...payload, ...mapInfantToApi(answers) };
        break;

      case "children":
        payload = { ...payload, ...mapChildrenToApi(answers) };
        break;

      case "feAdolescentUn":
        payload = { ...payload, ...mapFeAdolescentUnToApi(answers) };
        break;

      case "feAdolescentMa":
        payload = { ...payload, ...mapFeAdolescentMaToApi(answers) };
        break;

      case "maAdolescentMa":
        payload = { ...payload, ...mapMaAdolescentMaToApi(answers) };
        break;

      case "feReproductive":
        payload = { ...payload, ...mapFeReproductiveToApi(answers) };
        break;

      case "pregnantWoman":
        payload = { ...payload, ...mapPregnantWomanToApi(answers) };
        break;

      case "postpartumWo":
        payload = { ...payload, ...mapPostpartumWoToApi(answers) };
        break;

      case "adultMf":
        payload = { ...payload, ...mapAdultMfToApi(answers) };
        break;

      case "socialProtectionWomen":
        payload = {
          ...payload,
          ...mapSocialProtectionWomenToApi(answers),
        };
        break;

      case "disableInfant":
        payload = {
          ...payload,
          ...mapDisableInfantToApi(answers),
        };
        break;
    }
  }

  return payload;
}
