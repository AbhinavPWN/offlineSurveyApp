import { QuestionConfig } from "../../components/QuestionRenderer";

export const pregnantWomanQuestions: QuestionConfig[] = [
  {
    key: "pregnantWomanQ1",
    label: "Date of last menstruation (LMP)",
    labelNp: "अन्तिम महिनावारी मिति",
    type: "text",
    placeholder: "Enter BS date",
    required: true,
    validation: [{ type: "required", message: "Required" }],
  },

  {
    key: "pregnantWomanQ2",
    label: "Expected Date of Delivery (EDD)",
    labelNp: "बच्चा जन्मने अनुमानित मिति",
    type: "text",
    placeholder: "Enter BS date",
    required: true,
    validation: [{ type: "required", message: "Required" }],
  },

  {
    key: "pregnantWomanQ3",
    label: "Is this your first pregnancy?",
    labelNp: "के यो पहिलो गर्भ हो?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "हो", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "Required" }],
  },

  // ---------- Previous conditions ----------
  {
    key: "pregnantWomanQ4",
    label: "Previous pregnancy complications",
    labelNp: "अघिल्लो गर्भका समस्याहरू",
    type: "checkbox",
    options: [
      { label: "Abortion", labelNp: "गर्भपतन", value: "A" },
      { label: "Still birth", labelNp: "मृत बच्चा जन्मिएको", value: "S" },
      {
        label: "C-section",
        labelNp: "शल्यक्रिया (अप्रेसन) गरेर बच्चा जन्माएको",
        value: "C",
      },
      { label: "Eclampsia", labelNp: "काप्ने समस्या", value: "E" },
      {
        label: "Ante or post-partum haemorrhage",
        labelNp: "सुत्केरी हुनु अघि वा पछि धेरै रगत बगेको",
        value: "AP",
      },
      { label: "High BP", labelNp: "उच्च रक्तचाप", value: "H" },
      { label: "Diabetes", labelNp: "मधुमेह - चिनी रोग", value: "D" },
      { label: "Others", labelNp: "अन्य", value: "O" },
    ],
  },

  {
    key: "pregnantWomanQ4Others",
    label: "Other complication",
    labelNp: "अन्य विवरण",
    type: "text",
    visibleIf: { dependsOn: "pregnantWomanQ4", value: "O" },
    required: true,
    validation: [{ type: "required", message: "Required" }],
  },

  // ---------- ANC ----------
  {
    key: "pregnantWomanQ5",
    label: "Visited for ANC?",
    labelNp: "गर्भ जाँच गराउनुभयो?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "देखाएँ", value: "Y" },
      { label: "No", labelNp: "देखाएको छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "Required" }],
  },

  {
    key: "pregnantWomanQ6",
    label: "When did you visit?",
    labelNp: "कहिले जानुभयो?",
    type: "text",
    visibleIf: { dependsOn: "pregnantWomanQ5", value: "Y" },
    required: true,
    validation: [{ type: "required", message: "Required" }],
  },

  {
    key: "pregnantWomanQ7",
    label: "Iron tablets taken (last month)",
    labelNp: "आइरन चक्की संख्या",
    type: "text",
    required: true,
    validation: [{ type: "required", message: "Required" }],
  },

  {
    key: "pregnantWomanQ8",
    label: "Calcium tablets taken (last month)",
    labelNp: "क्याल्सियम चक्की संख्या",
    type: "text",
    required: true,
    validation: [{ type: "required", message: "Required" }],
  },

  {
    key: "pregnantWomanQ9",
    label: "TT vaccination taken?",
    labelNp: "टिटी सुई लगाउनुभयो?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "लगाएँ", value: "Y" },
      { label: "No", labelNp: "लगाएको छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "Required" }],
  },

  {
    key: "pregnantWomanQ10",
    label: "Number of TT doses",
    labelNp: "टिटी सुई संख्या",
    type: "text",
    visibleIf: { dependsOn: "pregnantWomanQ9", value: "Y" },
    required: true,
    validation: [{ type: "required", message: "Required" }],
  },

  {
    key: "pregnantWomanQ11",
    label: "Blood Pressure",
    labelNp: "रक्तचाप",
    type: "text",
    required: true,
    validation: [{ type: "required", message: "Required" }],
  },

  {
    key: "pregnantWomanQ12",
    label: "Blood Glucose",
    labelNp: "रगतमा चिनी",
    type: "text",
    required: true,
    validation: [{ type: "required", message: "Required" }],
  },

  {
    key: "pregnantWomanQ13",
    label: "Have you made birth plan?",
    labelNp: "सुत्केरी योजना बनाउनुभयो?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "Required" }],
  },
];
