import XLSX from "xlsx";
import fs from "fs";

// Load Excel
const districtWorkbook = XLSX.readFile("./district.xlsx");
const vdcWorkbook = XLSX.readFile("./vdlist.xlsx");

const districtSheet = districtWorkbook.Sheets[districtWorkbook.SheetNames[0]];
const vdcSheet = vdcWorkbook.Sheets[vdcWorkbook.SheetNames[0]];

const districtsRaw = XLSX.utils.sheet_to_json<any>(districtSheet, {
  defval: "",
});

console.log("District columns:", Object.keys(districtsRaw[0]));
console.log("First 3 district rows:", districtsRaw.slice(0, 3));
const municipalitiesRaw = XLSX.utils.sheet_to_json<any>(vdcSheet);

// Safety Check
if (!districtsRaw.length) {
  throw new Error("No districts found in district.xlsx");
}

if (!municipalitiesRaw.length) {
  throw new Error("No municipalities found in vdlist.xlsx");
}

// Provinces
const provinces = [
  { id: "1", name_en: "Koshi Province", name_np: "Koshi Province" },
  { id: "2", name_en: "Madhesh Province", name_np: "Madhesh Province" },
  { id: "3", name_en: "Bagmati Province", name_np: "Bagmati Province" },
  { id: "4", name_en: "Gandaki Province", name_np: "Gandaki Province" },
  { id: "5", name_en: "Lumbini Province", name_np: "Lumbini Province" },
  { id: "6", name_en: "Karnali Province", name_np: "Karnali Province" },
  {
    id: "7",
    name_en: "Sudurpashchim Province",
    name_np: "Sudurpashchim Province",
  },
];

// Districts
const districts = districtsRaw
  .filter((d: any) => d.DISTRICT_CODE && d.DISTRICT_DESC && d.PROVINCE_CODE)
  .map((d: any) => ({
    id: String(d.DISTRICT_CODE),
    province_id: String(d.PROVINCE_CODE),
    name_en: d.DISTRICT_DESC.trim(),
    name_np: d.DISTRICT_DESC.trim(),
  }));

// Municipalities
const municipalities = municipalitiesRaw
  .filter((m: any) => m.VDCNP_CODE && m.VDCNP_DESC && m.DISTRICT_CODE)
  .map((m: any) => ({
    id: String(m.VDCNP_CODE),
    district_id: String(m.DISTRICT_CODE),
    province_id: String(m.PROVINCE),
    name_en: m.VDCNP_DESC.trim(),
    name_np: m.VDCNP_DESC.trim(),
  }));

const master = {
  provinces,
  districts,
  municipalities,
};

console.log("District count:", districts.length);
console.log("Municipality count:", municipalities.length);

fs.writeFileSync("./nepalAddressMaster.json", JSON.stringify(master, null, 2));

console.log("✅ Nepal address master generated successfully!");
