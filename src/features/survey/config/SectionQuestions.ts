import { SurveySectionKey } from "../engine/surveyClassifier";
import { QuestionConfig } from "../components/QuestionRenderer";
import { neonateQuestions } from "./sections/neonateQuestions";
import { postpartumWoQuestions } from "./sections/postpartumQuestions";
import { infantQuestions } from "./sections/infantQuestions";
import { childrenQuestions } from "./sections/childrenQuestions";
import { feAdolescentUnQuestions } from "./sections/femaleAdolescentUnGirlQuestions";
import { feAdolescentMaQuestions } from "./sections/femaleAdolescentMaQuestions";
import { maAdolescentMaQuestions } from "./sections/maleAdolescentMaQuestions";
import { feReproductiveQuestions } from "./sections/femaleReproductiveQuestions";
import { pregnantWomanQuestions } from "./sections/pregnantWomanQuestions";
import { adultMfQuestions } from "./sections/adultMfQuestions";
import { socialProtectionWomenQuestions } from "./sections/socialProtectionWomenQuestions";
import { disableInfantQuestions } from "./sections/disableInfantQuestions";

export const SECTION_QUESTIONS: Record<SurveySectionKey, QuestionConfig[]> = {
  neonate: neonateQuestions,
  infant: infantQuestions,
  children: childrenQuestions,
  feAdolescentUn: feAdolescentUnQuestions,
  feAdolescentMa: feAdolescentMaQuestions,
  maAdolescentMa: maAdolescentMaQuestions,
  feReproductive: feReproductiveQuestions,
  pregnantWoman: pregnantWomanQuestions,
  postpartumWo: postpartumWoQuestions,
  adultMf: adultMfQuestions,
  socialProtectionWomen: socialProtectionWomenQuestions,
  disableInfant: disableInfantQuestions,
};
