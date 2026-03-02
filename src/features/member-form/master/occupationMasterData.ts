import { DropdownOption } from "../models/DropdownOptions";

/**
 * Caste Options
 */

/**
 * Religion Options
 */
export const religionOptions: DropdownOption[] = [
  { value: "1", labelEn: "Hindu", labelNp: "हिन्दू" },
  { value: "2", labelEn: "Buddhist", labelNp: "बौद्ध" },
  { value: "3", labelEn: "Islam", labelNp: "इस्लाम" },
  { value: "4", labelEn: "Kiranti", labelNp: "किराँती" },
  { value: "5", labelEn: "Christian", labelNp: "क्रिश्चियन" },
  { value: "6", labelEn: "Jain", labelNp: "जैन" },
  { value: "7", labelEn: "Sikh", labelNp: "सिख" },
  { value: "8", labelEn: "Bahai", labelNp: "बहाई" },
  { value: "9", labelEn: "Others", labelNp: "अन्य" },
];

/**
 * Occupation Options
 */
export const occupationOptions: DropdownOption[] = [
  { value: "1", labelEn: "Agriculture", labelNp: "कृषि" },
  { value: "2", labelEn: "Hotel", labelNp: "होटल" },
  { value: "3", labelEn: "Housewife", labelNp: "गृहिणी" },
  { value: "4", labelEn: "Cottage Industry", labelNp: "घरेलु उद्योग" },
  { value: "5", labelEn: "Casual Labor", labelNp: "अनौपचारिक श्रम" },
  { value: "6", labelEn: "Service", labelNp: "सेवा" },
  { value: "7", labelEn: "Student", labelNp: "विद्यार्थी" },
];

/**
 * Education Options
 */
export const educationOptions: DropdownOption[] = [
  {
    value: "1",
    labelEn: "Master Degree",
    labelNp: "स्नातकोत्तर वा सोभन्दा माथि",
  },
  { value: "2", labelEn: "Bachelor", labelNp: "स्नातक" },
  { value: "3", labelEn: "Intermediate", labelNp: "१२ कक्षा / PCL / डिप्लोमा" },
  { value: "4", labelEn: "SLC", labelNp: "एसएलसी" },
  { value: "5", labelEn: "8–10 Class", labelNp: "८–१० कक्षा" },
  { value: "6", labelEn: "5–7 Class", labelNp: "५–७ कक्षा" },
  { value: "7", labelEn: "Below 5", labelNp: "५ भन्दा कम" },
  { value: "8", labelEn: "Illiterate", labelNp: "निरक्षर" },
  { value: "10", labelEn: "Self (Can write name)", labelNp: "नाम लेख्न सक्छ" },
];
