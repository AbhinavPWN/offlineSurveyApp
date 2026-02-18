export interface Municipality {
  code: string;
  name: string;
}

export interface District {
  code: string;
  name: string;
  municipalities: Municipality[];
}

export const LUMBINI_DISTRICTS: District[] = [
  {
    code: "508",
    name: "Rupandehi",
    municipalities: [
      { code: "50801", name: "Butwal Sub-Metropolitan" },
      { code: "50802", name: "Siddharthanagar Municipality" },
      { code: "50803", name: "Devdaha Municipality" },
      { code: "50804", name: "Lumbini Sanskritik Municipality" },
      { code: "50805", name: "Tilottama Municipality" },
      { code: "50806", name: "Sainamaina Municipality" },
      { code: "50807", name: "Marchawari Rural Municipality" },
      { code: "50808", name: "Kotahimai Rural Municipality" },
    ],
  },
  {
    code: "507",
    name: "Kapilvastu",
    municipalities: [
      { code: "50701", name: "Kapilvastu Municipality" },
      { code: "50702", name: "Banganga Municipality" },
      { code: "50703", name: "Buddhabhumi Municipality" },
      { code: "50704", name: "Shivaraj Municipality" },
      { code: "50705", name: "Krishnanagar Municipality" },
      { code: "50706", name: "Maharajgunj Municipality" },
    ],
  },
  {
    code: "509",
    name: "Nawalparasi West",
    municipalities: [
      { code: "50901", name: "Ramgram Municipality" },
      { code: "50902", name: "Sunwal Municipality" },
      { code: "50903", name: "Sarawal Rural Municipality" },
      { code: "50904", name: "Pratappur Rural Municipality" },
    ],
  },
  {
    code: "510",
    name: "Dang",
    municipalities: [
      { code: "51001", name: "Ghorahi Sub-Metropolitan" },
      { code: "51002", name: "Tulsipur Sub-Metropolitan" },
      { code: "51003", name: "Lamahi Municipality" },
      { code: "51004", name: "Rapti Rural Municipality" },
    ],
  },
  {
    code: "511",
    name: "Banke",
    municipalities: [
      { code: "51101", name: "Nepalgunj Sub-Metropolitan" },
      { code: "51102", name: "Kohalpur Municipality" },
      { code: "51103", name: "Baijanath Rural Municipality" },
      { code: "51104", name: "Janaki Rural Municipality" },
    ],
  },
  {
    code: "512",
    name: "Bardiya",
    municipalities: [
      { code: "51201", name: "Gulariya Municipality" },
      { code: "51202", name: "Rajapur Municipality" },
      { code: "51203", name: "Thakurbaba Municipality" },
    ],
  },
  {
    code: "513",
    name: "Pyuthan",
    municipalities: [
      { code: "51301", name: "Pyuthan Municipality" },
      { code: "51302", name: "Sworgadwari Municipality" },
    ],
  },
  {
    code: "514",
    name: "Rolpa",
    municipalities: [
      { code: "51401", name: "Rolpa Municipality" },
      { code: "51402", name: "Sunil Smriti Rural Municipality" },
    ],
  },
  {
    code: "515",
    name: "Rukum East",
    municipalities: [
      { code: "51501", name: "Bhume Rural Municipality" },
      { code: "51502", name: "Sisne Rural Municipality" },
    ],
  },
  {
    code: "516",
    name: "Gulmi",
    municipalities: [
      { code: "51601", name: "Resunga Municipality" },
      { code: "51602", name: "Tamghas Municipality" },
    ],
  },
  {
    code: "517",
    name: "Arghakhanchi",
    municipalities: [
      { code: "51701", name: "Sandhikharka Municipality" },
      { code: "51702", name: "Sitganga Municipality" },
    ],
  },
  {
    code: "518",
    name: "Palpa",
    municipalities: [
      { code: "51801", name: "Tansen Municipality" },
      { code: "51802", name: "Rampur Municipality" },
    ],
  },
];
