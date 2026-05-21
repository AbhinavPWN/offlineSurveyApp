import { SurveySectionKey } from "../engine/surveyClassifier";

// Defining Type
type sectionConfig = {
  key: SurveySectionKey;
  title: string;
};

// Object mapping
export const SECTION_CONFIG: Record<SurveySectionKey, sectionConfig> = {
  neonate: {
    key: "neonate",
    title: "Neonate",
  },
  infant: {
    key: "infant",
    title: "Infant",
  },
  children: {
    title: "Children",
    key: "children",
  },
  feAdolescentMa: {
    key: "feAdolescentMa",
    title: "Female Adolescent (Married)",
  },
  feAdolescentUn: {
    key: "feAdolescentUn",
    title: "Female Adolescent (Unmarried)",
  },
  maAdolescentMa: {
    key: "maAdolescentMa",
    title: "Male Adolescent",
  },
  feReproductive: {
    key: "feReproductive",
    title: "Reproductive Health",
  },
  pregnantWoman: {
    key: "pregnantWoman",
    title: "Pregnancy",
  },
  postpartumWo: {
    key: "postpartumWo",
    title: "Postpartum Care",
  },
  adultMf: {
    key: "adultMf",
    title: "Adult Health",
  },
  socialProtectionWomen: {
    key: "socialProtectionWomen",
    title: "Social Protection",
  },
  disableInfant: {
    key: "disableInfant",
    title: "Disability Social Protection",
  },
};
