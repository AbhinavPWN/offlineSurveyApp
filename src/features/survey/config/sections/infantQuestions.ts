import { QuestionConfig } from "../../components/QuestionRenderer";

export const infantQuestions: QuestionConfig[] = [
  {
    key: "infantQ1",
    label: "In the last 24 hours, is the baby breastfed only?",
    labelNp: "पछिल्लो २४ घण्टामा बच्चालाई आमाको दूध मात्र खुवाइएको छ?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  // ---------- Vaccination ----------
  {
    key: "infantQ2",
    label: "BCG at birth",
    labelNp: "BCG - जन्मनासाथ",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "लगाइयो", value: "Y" },
      { label: "No", labelNp: "लगाइएन", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "infantQ3",
    label: "Penta-1, Polio-1, PCV-1 (within 6 weeks)",
    labelNp: "पेन्टा-१, पोलियो-१ + PCV-१ (६ हप्ताभित्र)",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "लगाइयो", value: "Y" },
      { label: "No", labelNp: "लगाइएन", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "infantQ4",
    label: "Penta-2, Polio-2, PCV-2 (within 10 weeks)",
    labelNp: "पेन्टा-२, पोलियो-२ + PCV-२ (१० हप्ताभित्र)",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "लगाइयो", value: "Y" },
      { label: "No", labelNp: "लगाइएन", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "infantQ5",
    label: "Penta-3, Polio-3, IPV (within 14 weeks)",
    labelNp: "पेन्टा-३, पोलियो-३ + IPV (१४ हप्ताभित्र)",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "लगाइयो", value: "Y" },
      { label: "No", labelNp: "लगाइएन", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "infantQ6",
    label: "PCV-3 (within 18 weeks)",
    labelNp: "PCV-३ (१८ हप्ताभित्र)",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "लगाइयो", value: "Y" },
      { label: "No", labelNp: "लगाइएन", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  // ---------- Health ----------
  {
    key: "infantQ7",
    label: "Has the baby had diarrhea in last 15 days?",
    labelNp: "पछिल्लो १५ दिनमा बच्चालाई पखाला लागेको छ?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "infantQ8",
    label: "Was the baby given only breastmilk during illness?",
    labelNp: "बिरामी हुँदा बच्चालाई आमाको दूध मात्र खुवाइएको थियो?",
    type: "select",
    required: true,
    visibleIf: {
      dependsOn: "infantQ7",
      value: "Y",
    },
    options: [
      { label: "Yes", labelNp: "थियो", value: "Y" },
      { label: "No", labelNp: "थिएन", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },
];
