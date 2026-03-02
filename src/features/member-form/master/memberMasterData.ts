import { DropdownOption } from "../models/DropdownOptions";

export const genderOptions: DropdownOption[] = [
  { labelEn: "Male", labelNp: "पुरुष", value: "M" },
  { labelEn: "Female", labelNp: "महिला", value: "F" },
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
  { value: "BRO", labelEn: "Brother", labelNp: "भाइ" },
  { value: "SIS", labelEn: "Sister", labelNp: "बहिनी" },
  { value: "SON", labelEn: "Son", labelNp: "छोरा" },
  { value: "DAU", labelEn: "Daughter", labelNp: "छोरी" },
  { value: "DIL", labelEn: "Daughter in Law", labelNp: "बुहारी" },
  { value: "GSON", labelEn: "Grand Son", labelNp: "नाति" },
  { value: "GDAU", labelEn: "Grand Daughter", labelNp: "नातिनी" },
  { value: "GM", labelEn: "Grand Mother", labelNp: "हजुरआमा" },
  { value: "MIL", labelEn: "Mother in Law", labelNp: "सासु" },
];

// export const districtOptions: DropdownOption[] = [
//   { value: "106", labelEn: "Bhojpur", labelNp: "भोजपुर" },
//   { value: "306", labelEn: "Kathmandu", labelNp: "काठमाडौं" },
//   { value: "308", labelEn: "Lalitpur", labelNp: "ललितपुर" },
//   { value: "508", labelEn: "Rupandehi", labelNp: "रुपन्देही" },
//   { value: "113", labelEn: "Sunsari", labelNp: "सुनसरी" },
//   // ⚠️ Add remaining gradually (do not paste 77 districts inline now)
// ];
