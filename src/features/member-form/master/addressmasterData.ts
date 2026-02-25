import { DropdownOption } from "../models/DropdownOptions";

/**
 * Address Type Options
 */
export const addressTypeOptions: DropdownOption[] = [
  { value: "P", labelEn: "Permanent", labelNp: "स्थायी" },
  { value: "T", labelEn: "Temporary", labelNp: "अस्थायी" },
];

/**
 * VDC Indexed by District
 * Only adding sample districts for now.
 * Expand gradually using your Excel.
 */
export const vdcByDistrict: Record<string, DropdownOption[]> = {
  "508": [
    {
      value: "50808",
      labelEn: "Tilottama Municipality",
      labelNp: "तिलोत्तमा नगरपालिका",
    },
    {
      value: "50802",
      labelEn: "Butwal Sub-Metropolitan",
      labelNp: "बुटवल उपमहानगरपालिका",
    },
  ],
  "306": [
    {
      value: "30608",
      labelEn: "Kathmandu Metropolitan",
      labelNp: "काठमाडौं महानगरपालिका",
    },
  ],
  "308": [
    {
      value: "30802",
      labelEn: "Lalitpur Metropolitan",
      labelNp: "ललितपुर महानगरपालिका",
    },
  ],
};

/**
 * Province by District
 */
export const provinceByDistrict: Record<string, string> = {
  "508": "5",
  "306": "3",
  "308": "3",
};
