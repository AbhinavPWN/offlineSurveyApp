export type GuidanceItem = {
  en: string;
  np: string;
  category?:
    | "nutrition"
    | "mental_health"
    | "hygiene"
    | "danger_sign"
    | "referral"
    | "general"
    | "family_planning"
    | "substance_abuse"
    | "non_communicable_disease";
};

export type GuidanceGroup = {
  title: string;
  items: GuidanceItem[];
};

export type SectionGuidance = {
  title: string;

  // Existing support
  items?: GuidanceItem[];

  // New optional grouped support
  groups?: GuidanceGroup[];
};
