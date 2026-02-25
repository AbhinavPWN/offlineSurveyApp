import { DropdownOption } from "../models/DropdownOptions";
import {
  DifficultyLevel,
  HealthConditionCode,
  DisabilityType,
} from "./health.enum";

// Yes/No options
export const yesNoOptions: DropdownOption[] = [
  { value: "Y", labelEn: "Yes", labelNp: "हो" },
  { value: "N", labelEn: "No", labelNp: "होइन" },
];

// Health condition options
export const healthConditionOptions: DropdownOption[] = [
  {
    value: HealthConditionCode.CARDIO,
    labelEn: "Cardiovascular disease",
    labelNp: "मुटु सम्बन्धी रोग",
  },
  {
    value: HealthConditionCode.DIABETES,
    labelEn: "Diabetes",
    labelNp: "मधुमेह",
  },
  {
    value: HealthConditionCode.HYPERTENSION,
    labelEn: "Hypertension",
    labelNp: "उच्च रक्तचाप",
  },
  {
    value: HealthConditionCode.LUNG,
    labelEn: "Chronic lung disease",
    labelNp: "फोक्सो सम्बन्धी पुरानो रोग",
  },
  {
    value: HealthConditionCode.OTHER,
    labelEn: "Other",
    labelNp: "अन्य",
  },
];

// Disability Types
export const disabilityTypeOptions: DropdownOption[] = [
  { value: DisabilityType.VISION, labelEn: "Vision", labelNp: "दृष्टि" },
  { value: DisabilityType.HEARING, labelEn: "Hearing", labelNp: "सुन्ने" },
  { value: DisabilityType.MOBILITY, labelEn: "Mobility", labelNp: "हिँडडुल" },
  { value: DisabilityType.COGNITION, labelEn: "Cognition", labelNp: "स्मरण" },
  {
    value: DisabilityType.SELF_CARE,
    labelEn: "Self Care",
    labelNp: "आत्म-हेरचाह",
  },
  {
    value: DisabilityType.COMMUNICATION,
    labelEn: "Communication",
    labelNp: "सञ्चार",
  },
  { value: DisabilityType.AFFECT, labelEn: "Affect", labelNp: "भावनात्मक" },
  {
    value: DisabilityType.UPPER_BODY,
    labelEn: "Upper Body",
    labelNp: "माथिल्लो शरीर",
  },
  { value: DisabilityType.PAIN, labelEn: "Pain", labelNp: "दुखाइ" },
  { value: DisabilityType.FATIGUE, labelEn: "Fatigue", labelNp: "थकान" },
];

// Difficulty options
export const difficultyOptions: DropdownOption[] = [
  {
    value: DifficultyLevel.NO_DIFFICULTY,
    labelEn: "No difficulty",
    labelNp: "कुनै कठिनाइ छैन",
  },
  {
    value: DifficultyLevel.SOME_DIFFICULTY,
    labelEn: "Some difficulty",
    labelNp: "केही कठिनाइ छ",
  },
  {
    value: DifficultyLevel.A_LOT_OF_DIFFICULTY,
    labelEn: "A lot of difficulty",
    labelNp: "धेरै कठिनाइ छ",
  },
  {
    value: DifficultyLevel.CANNOT_DO,
    labelEn: "Cannot do at all",
    labelNp: "पटक्कै सक्दैन",
  },
];
