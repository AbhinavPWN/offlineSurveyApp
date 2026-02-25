import { MemberFormState } from "../models/MemberFormState";

export interface HealthApiPayload {
  healthConditionsYn: string;
  healthConditions: string;
  disabilityIdentYn: string;
  disabilityIdent: string;
  seeing: string;
  hearing: string;
  walking: string;
  remembering: string;
  selfCare: string;
  communicating: string;
  disabilityStatus: string;
  pregnancyStatus: string;
  pregnancyDate: string;
  vaccinationStatus: string;
  healthInsCoverage: string;
}

export function mapHealthToApi(state: MemberFormState): HealthApiPayload {
  return {
    healthConditionsYn: state.healthConditionsYn ? "Y" : "N",
    healthConditions: state.healthConditionsYn
      ? state.healthConditions || ""
      : "",

    disabilityIdentYn: state.disabilityIdentYn ? "Y" : "N",
    disabilityIdent: state.disabilityIdentYn ? state.disabilityIdent || "" : "",

    seeing: state.seeing || "N",
    hearing: state.hearing || "N",
    walking: state.walking || "N",
    remembering: state.remembering || "N",
    selfCare: state.selfCare || "N",
    communicating: state.communicating || "N",

    disabilityStatus: state.disabilityStatus || "N",

    pregnancyStatus: state.gender === "F" ? state.pregnancyStatus || "N" : "N",

    pregnancyDate:
      state.gender === "F" && state.pregnancyStatus === "Y"
        ? formatDateForApi(state.pregnancyDate)
        : "",

    vaccinationStatus: state.minorYn ? state.vaccinationStatus || "N" : "",

    healthInsCoverage: state.healthInsCoverage || "N",
  };
}

// function isChild(dob: string | null): boolean {
//   if (!dob) return false;

//   const today = new Date();
//   const birth = new Date(dob);

//   let age = today.getFullYear() - birth.getFullYear();
//   const m = today.getMonth() - birth.getMonth();

//   if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
//     age--;
//   }

//   return age < 18;
// }

// ISO → DD-MMM-YYYY
function formatDateForApi(iso: string | null): string {
  if (!iso) return "";

  const date = new Date(iso);

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

export function mapHealthFromApi(api: any): Partial<MemberFormState> {
  return {
    healthConditionsYn: api.healtH_CONDITIONS ? true : false,
    healthConditions: api.healtH_CONDITIONS || "",

    disabilityIdentYn: api.disabilitY_IDENTIFICATION ? true : false,
    disabilityIdent: api.disabilitY_IDENTIFICATION || "",

    seeing: api.seeing || "N",
    hearing: api.hearing || "N",
    walking: api.walking || "N",
    remembering: api.remembering || "N",
    selfCare: api.selF_CARE || "N",
    communicating: api.communicating || "N",

    disabilityStatus: api.disabilitY_STATUS || "N",

    pregnancyStatus: api.pregnancY_STATUS || "N",

    pregnancyDate: parseApiDate(api.pregnancY_DATE),

    vaccinationStatus: api.vaccinatioN_STATUS || null,

    healthInsCoverage: api.healtH_INSURANCE_COVERAGE || "N",
  };
}

function parseApiDate(dateStr: string | null): string | null {
  if (!dateStr) return null;

  // expects DD-MMM-YYYY
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return null;

  return parsed.toISOString().split("T")[0];
}
