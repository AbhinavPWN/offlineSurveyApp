import { DropdownOption } from "../models/DropdownOptions";

export const genderOptions: DropdownOption[] = [
  { labelEn: "Male", labelNp: "पुरुष", value: "M" },
  { labelEn: "Female", labelNp: "महिला", value: "F" },
  {
    labelEn: "Third Gender / Non-binary",
    labelNp: "तेस्रो लिङ्ग/अन्य",
    value: "B",
  },
  { labelEn: "Prefer Not to Say", labelNp: "बताउन नचाहने", value: "P" },
];

export const maritalStatusOptions: DropdownOption[] = [
  { labelEn: "Married", labelNp: "विवाहित", value: "M" },
  { labelEn: "Unmarried", labelNp: "अविवाहित", value: "U" },
  { labelEn: "Widowed", labelNp: "विधवा/विधुर", value: "W" },
  { labelEn: "Divorced", labelNp: "सम्बन्ध विच्छेद", value: "D" },
];

export const headHouseholdOptions: DropdownOption[] = [
  { labelEn: "Yes", labelNp: "हो", value: "Y" },
  { labelEn: "No", labelNp: "होइन", value: "N" },
];

export const relationToHHOptions: DropdownOption[] = [
  { value: "HHH", labelEn: "Household Head", labelNp: "घरपरिवार प्रमुख" },
  { value: "HUS", labelEn: "Husband", labelNp: "पति" },
  { value: "WIF", labelEn: "Wife", labelNp: "पत्नी" },
  { value: "SON", labelEn: "Son", labelNp: "छोरा" },
  { value: "DAU", labelEn: "Daughter", labelNp: "छोरी" },
  { value: "GM", labelEn: "Grand Mother", labelNp: "हजुरआमा" },
  { value: "SIW", labelEn: "Son-in-law", labelNp: "ज्वाई" },
  { value: "DIL", labelEn: "Daughter in Law", labelNp: "बुहारी" },
  { value: "GSON", labelEn: "Grand Son", labelNp: "नाति" },
  { value: "GDAU", labelEn: "Grand Daughter", labelNp: "नातिनी" },
  { value: "FAT", labelEn: "Father", labelNp: "बुवा" },
  { value: "MOT", labelEn: "Mother", labelNp: "आमा" },
  { value: "FIL", labelEn: "Father-in-law", labelNp: "ससुरा" },
  { value: "MIL", labelEn: "Mother in Law", labelNp: "सासु" },
  { value: "BRO", labelEn: "Brother", labelNp: "भाइ" },
  { value: "SIS", labelEn: "Sister", labelNp: "बहिनी" },
  { value: "BIL", labelEn: "Brother-in-law", labelNp: "भिनाजु/देवर/जेठाजु" },
  { value: "SIL", labelEn: "Sister-in-law", labelNp: "भाउजु/नन्द/साली" },
  { value: "OTH", labelEn: "Other Relative", labelNp: "अन्य नातेदार" },
];
