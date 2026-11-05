import { QuestionConfig } from "../../components/QuestionRenderer";

export const infantQuestions: QuestionConfig[] = [
  // ---------- FEEDING ----------
  {
    key: "infantQ1",
    label: "Q1. In the last 24 hours, is the baby breastfed only?",
    labelNp: "पछिल्लो २४ घण्टामा, बच्चालाई आमाको दूध मात्र खुवाइएको छ?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please confirm breastfeeding status",
      },
    ],
  },

  // ---------- VACCINATION HISTORY ----------
  {
    key: "infantQ2",
    label: "Q2. Vaccination history (adjust as per country policy)",
    labelNp: "खोपको विवरण (राष्ट्रिय खोप अनुसार)",
    type: "checkbox",
    options: [
      {
        label: "BCG – at birth",
        labelNp: "वि.सि.जि. (BCG) – जन्मनासाथ",
        value: "1",
      },
      {
        label: "Rota-1 + Penta-1 + Polio-1 + PCV-1 (within 6 weeks of birth)",
        labelNp:
          "रोटा-१ + पेन्टा-१, पोलियो-१ + पि.सि.भि.-१ – जन्मेको ६ हप्ताभित्र",
        value: "2",
      },
      {
        label: "Rota-2 + Penta-2 + Polio-2 + PCV-2 (within 10 weeks of birth)",
        labelNp:
          "रोटा-२ + पेन्टा-२, पोलियो-२ + पि.सि.भि.-२ – जन्मेको १० हप्ताभित्र",
        value: "3",
      },
      {
        label: "fIPV-1 + Penta-3 + Polio-3 + IPV (within 14 weeks of birth)",
        labelNp:
          "एफआईपीभी-१ + पेन्टा-३, पोलियो-३ + आइ.पि.भि. – जन्मेको १४ हप्ताभित्र",
        value: "4",
      },
    ],
  },

  // ---------- DIARRHEA ----------
  {
    key: "infantQ5",
    label: "Q3. Has the baby had diarrhea in last 15 days?",
    labelNp: "के पछिल्लो १५ दिनमा बच्चालाई पखाला लागेको थियो?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please confirm diarrhea history",
      },
    ],
  },

  // ---------- BREASTMILK ----------
  {
    key: "infantQ6",
    label: "Q4. Had he/she been given breastmilk only?",
    labelNp: "के उसलाई आमाको दूध मात्र खुवाइएको थियो?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "थियो", value: "Y" },
      { label: "No", labelNp: "थिएन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please confirm whether the baby was given breastmilk only",
      },
    ],
  },
];
