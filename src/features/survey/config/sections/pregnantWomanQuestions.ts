import { QuestionConfig } from "../../components/QuestionRenderer";

export const pregnantWomanQuestions: QuestionConfig[] = [
  // ---------- LMP ----------
  {
    key: "pregnantWomanQ1",
    label: "Date of last menstruation (LMP)",
    labelNp: "अन्तिम महिनावारी मिति",
    type: "text",
    inputFormat: "bs-date",
    keyboardType: "number-pad",
    placeholder: "YYYY-MM-DD",
    validation: [
      {
        type: "required",
        message: "Please enter last menstruation date",
      },
      {
        type: "pattern",
        value: /^\d{4}-\d{2}-\d{2}$/,
        message: "Enter valid date (YYYY-MM-DD)",
      },
    ],
  },

  // ---------- EDD (AUTO CALCULATED → NOT REQUIRED) ----------
  {
    key: "pregnantWomanQ2",
    label: "Expected Date of Delivery (EDD)",
    labelNp: "बच्चा जन्मने अनुमानित मिति",
    type: "text",
    inputFormat: "bs-date",
    readonly: true,
    keyboardType: "number-pad",
    placeholder: "Auto-calculated",
  },

  // ---------- FIRST PREGNANCY ----------
  {
    key: "pregnantWomanQ3",
    label: "Is this your first pregnancy?",
    labelNp: "के यो पहिलो गर्भ हो?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "हो", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please select if this is your first pregnancy",
      },
    ],
  },

  // ---------- PREVIOUS CONDITIONS (ONLY if NOT first pregnancy) ----------
  {
    key: "pregnantWomanQ4",
    label: "Have you had following conditions in your previous pregnancies?",
    labelNp: "अघिल्लो गर्भका समस्याहरू",
    type: "checkbox",
    visibleIf: {
      dependsOn: "pregnantWomanQ3",
      operator: "equals",
      value: "N",
    },
    options: [
      { label: "Abortion", labelNp: "गर्भपतन", value: "A" },
      { label: "Still birth", labelNp: "मृत बच्चा जन्मिएको", value: "S" },
      { label: "C-section", labelNp: "अप्रेसन", value: "C" },
      { label: "Eclampsia", labelNp: "काप्ने समस्या", value: "E" },
      { label: "Haemorrhage", labelNp: "धेरै रगत बगेको", value: "AP" },
      { label: "High BP", labelNp: "उच्च रक्तचाप", value: "H" },
      { label: "Diabetes", labelNp: "मधुमेह", value: "D" },
      { label: "Others", labelNp: "अन्य", value: "O" },
    ],
  },

  {
    key: "pregnantWomanQ4Others",
    label: "Other complication",
    labelNp: "अन्य विवरण",
    type: "text",
    visibleIf: {
      dependsOn: "pregnantWomanQ4",
      operator: "includes",
      value: "O",
    },
    validation: [
      {
        type: "required",
        message: "Please specify other complication",
      },
    ],
  },

  // ---------- ANC ----------
  {
    key: "pregnantWomanQ5",
    label: "Visited for ANC?",
    labelNp: "गर्भ जाँच गराउनुभयो?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "देखाएँ", value: "Y" },
      { label: "No", labelNp: "देखाएको छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please select if you visited for ANC",
      },
    ],
  },

  {
    key: "pregnantWomanQ6",
    label: "When did you visit?",
    labelNp: "कहिले जानुभयो?",
    type: "text",
    inputFormat: "bs-date",
    keyboardType: "number-pad",
    placeholder: "YYYY-MM-DD",
    visibleIf: {
      dependsOn: "pregnantWomanQ5",
      value: "Y",
    },
    validation: [
      {
        type: "required",
        message: "Please enter visit date",
      },
      {
        type: "pattern",
        value: /^\d{4}-\d{2}-\d{2}$/,
        message: "Enter valid date (YYYY-MM-DD)",
      },
    ],
  },

  // ---------- TABLETS ----------
  {
    key: "pregnantWomanQ7",
    label: "How many iron-folate tablets have you taken in last one month?",
    labelNp: "आइरन चक्की संख्या",
    type: "text",
    keyboardType: "number-pad",
    placeholder: "e.g. 30",
    visibleIf: {
      dependsOn: "pregnantWomanQ5",
      value: "Y",
    },
    validation: [
      {
        type: "required",
        message: "Please enter number of iron tablets",
      },
    ],
  },

  {
    key: "pregnantWomanQ8",
    label: "How many calcium tablets have you taken in last one month?",
    labelNp: "क्याल्सियम चक्की संख्या",
    type: "text",
    keyboardType: "number-pad",
    placeholder: "e.g. 30",
    validation: [
      {
        type: "required",
        message: "Please enter number of calcium tablets",
      },
    ],
  },

  // ---------- TT ----------
  {
    key: "pregnantWomanQ9",
    label: "Have you taken TT vaccination",
    labelNp: "टिटी सुई लगाउनुभयो?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "लगाएँ", value: "Y" },
      { label: "No", labelNp: "लगाएको छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please select TT vaccination status",
      },
    ],
  },

  {
    key: "pregnantWomanQ10",
    label: "Number of TT doses",
    labelNp: "टिटी सुई संख्या",
    type: "text",
    keyboardType: "number-pad",
    placeholder: "e.g. 2",
    visibleIf: {
      dependsOn: "pregnantWomanQ9",
      value: "Y",
    },
    validation: [
      {
        type: "required",
        message: "Please enter number of TT doses",
      },
    ],
  },

  // ---------- BP ----------
  {
    key: "pregnantWomanQ11",
    label: "Blood Pressure (mm of Hg)",
    labelNp: "रक्तचाप",
    type: "text",
    keyboardType: "number-pad",
    placeholder: "e.g. 120/80",
    validation: [
      {
        type: "required",
        message: "Please enter blood pressure",
      },
      {
        type: "pattern",
        value: /^\d{2,3}\/\d{2,3}$/,
        message: "Enter format like 120/80",
      },
    ],
  },

  // ---------- GLUCOSE ----------
  {
    key: "pregnantWomanQ12",
    label: "Blood Glucose (mmol/L)",
    labelNp: "रगतमा चिनी",
    type: "text",
    keyboardType: "number-pad",
    placeholder: "e.g. 5.6",
    validation: [
      {
        type: "required",
        message: "Please enter blood glucose level",
      },
    ],
  },

  // ---------- BIRTH PLAN ----------
  {
    key: "pregnantWomanQ13",
    label:
      " Have you made a birth plan? (which facility you will go for delivery, saved money, had blood grouping done and had a blood donor ready)",
    labelNp:
      "के तपाईंले सुत्केरी हुने योजना (Birth Plan) बनाउनुभएको छ ? (कुन अस्पताल जाने, पैसाको जोहो, रगतको समूह जाँच र रगत दिने मान्छे तयार पार्ने) ",
    type: "select",
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please select birth plan status",
      },
    ],
  },
];
