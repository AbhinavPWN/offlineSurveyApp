import { SurveySectionKey } from "../engine/surveyClassifier";

import { SectionGuidance } from "./guidance/guidanceTypes";

import { feAdolescentUnGuidance } from "./guidance/feAdolescentUnGuidance";
import { feAdolescentMaGuidance } from "./guidance/feAdolescentMaGuidance";
import { maAdolescentGuidance } from "./guidance/maAdolescentMaGuidance";
import { childrenGuidance } from "./guidance/childrenGuidance";
import { infantGuidance } from "./guidance/infantGuidance";
import { pregnantWomanGuidance } from "./guidance/pregnantWomanGuidance";
import { feReproductiveGuidance } from "./guidance/feReproductiveGuidance";
import { adultMfGuidance } from "./guidance/adultMfGuidance";
import { neonateGuidance } from "./guidance/neonateGuidance";
import { postpartumWoGuidance } from "./guidance/postpartumWoGuidance";

export const SECTION_GUIDANCE_CONFIG: Partial<
  Record<SurveySectionKey, SectionGuidance>
> = {
  feAdolescentUn: feAdolescentUnGuidance,
  feAdolescentMa: feAdolescentMaGuidance,
  maAdolescentMa: maAdolescentGuidance,
  children: childrenGuidance,
  infant: infantGuidance,
  pregnantWoman: pregnantWomanGuidance,
  feReproductive: feReproductiveGuidance,
  adultMf: adultMfGuidance,
  neonate: neonateGuidance,
  postpartumWo: postpartumWoGuidance,
};
