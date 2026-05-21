import { QuestionConfig } from "../../components/QuestionRenderer";

export const infantQuestions: QuestionConfig[] = [
  // ---------- FEEDING ----------
  {
    key: "infantQ1",
    label: "In the last 24 hours, is the baby breastfed only?",
    labelNp: "पछिल्लो २४ घण्टामा बच्चालाई आमाको दूध मात्र खुवाइएको छ?",
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
    label: "Vaccination history",
    labelNp: "खोपको विवरण",
    type: "checkbox",
    options: [
      {
        label: "BCG – at birth",
        labelNp: "BCG – जन्मनासाथ",
        value: "1",
      },
      {
        label: "Penta-1 / Polio-1 / PCV-1 (within 6 weeks)",
        labelNp: "पेन्टा-१ / पोलियो-१ / PCV-१ (६ हप्ताभित्र)",
        value: "2",
      },
      {
        label: "Penta-2 / Polio-2 / PCV-2 (within 10 weeks)",
        labelNp: "पेन्टा-२ / पोलियो-२ / PCV-२ (१० हप्ताभित्र)",
        value: "3",
      },
      {
        label: "Penta-3 / Polio-3 / IPV (within 14 weeks)",
        labelNp: "पेन्टा-३ / पोलियो-३ / IPV (१४ हप्ताभित्र)",
        value: "4",
      },
      {
        label: "PCV-3 (within 18 weeks)",
        labelNp: "PCV-३ (१८ हप्ताभित्र)",
        value: "5",
      },
    ],
  },

  // ---------- LAST VACCINATION PLACE ----------
  {
    key: "infantQ3",
    label: "Where was the most recent vaccination received?",
    labelNp: "सबैभन्दा पछिल्लो पटक खोप कहाँ लगाइएको थियो?",
    type: "select",
    options: [
      {
        label: "Government facility",
        labelNp: "सरकारी स्वास्थ्य संस्था",
        value: "G",
      },
      {
        label: "Private facility",
        labelNp: "निजी अस्पताल वा क्लिनिक",
        value: "P",
      },
      {
        label: "Health camp organized by program",
        labelNp: "कार्यक्रमद्वारा सञ्चालन गरिएको स्वास्थ्य शिविर",
        value: "C",
      },
      {
        label: "Don't know",
        labelNp: "थाहा छैन",
        value: "D",
      },
    ],
    validation: [
      {
        type: "required",
        message: "Please select vaccination location",
      },
    ],
  },

  // ---------- LAST VACCINATION DATE ----------
  {
    key: "infantQ4",
    label: "Date of most recent vaccination",
    labelNp: "सबैभन्दा पछिल्लो खोप लगाइएको मिति",
    type: "text",
    placeholder: "2082-01-15",
    inputFormat: "bs-date",
    validation: [
      {
        type: "required",
        message: "Please enter vaccination date",
      },
      {
        type: "pattern",
        message: "Enter valid BS date in YYYY-MM-DD format",
      },
    ],
  },

  // ---------- DIARRHEA ----------
  {
    key: "infantQ5",
    label: "Has the baby had diarrhea in last 15 days?",
    labelNp: "पछिल्लो १५ दिनमा बच्चालाई पखाला लागेको छ?",
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

  // ---------- BREASTMILK DURING ILLNESS ----------
  {
    key: "infantQ6",
    label: "Was the baby given breastmilk only during illness?",
    labelNp: "बिरामी हुँदा बच्चालाई आमाको दूध मात्र खुवाइएको थियो?",
    type: "select",
    visibleIf: {
      dependsOn: "infantQ5",
      value: "Y",
    },
    options: [
      { label: "Yes", labelNp: "थियो", value: "Y" },
      { label: "No", labelNp: "थिएन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please confirm feeding during illness",
      },
    ],
  },
];
