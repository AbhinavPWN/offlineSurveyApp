import { QuestionConfig } from "../../components/QuestionRenderer";

export const pregnantWomanQuestions: QuestionConfig[] = [
  // ---------- LMP ----------
  {
    key: "pregnantWomanQ1",
    label: "Date of your last menstruation (LMP)",
    labelNp: "तपाईंको अन्तिम पटक महिनावारी भएको मिति (LMP)",
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

  // ---------- EDD (AUTO CALCULATED) ----------
  {
    key: "pregnantWomanQ2",
    label: "Expected Date of Delivery (EDD)",
    labelNp: "बच्चा जन्मने अनुमानित मिति (EDD)",
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
    labelNp: "के यो तपाईंको पहिलो गर्भ हो?",
    type: "select",
    options: [
      {
        label: "Yes",
        labelNp: "हो",
        value: "Y",
      },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please select if this is your first pregnancy",
      },
    ],
  },

  // ---------- PREVIOUS PREGNANCY CONDITIONS ----------
  {
    key: "pregnantWomanQ4",
    label: "Have you had following conditions in your previous pregnancies?",
    labelNp:
      "के तपाईंलाई अघिल्लो गर्भको समयमा तलका मध्ये कुनै समस्या भएको थियो? (बक्समा चिन्ह लगाउनुहोस्)",
    type: "checkbox",
    visibleIf: {
      dependsOn: "pregnantWomanQ3",
      operator: "equals",
      value: "N",
    },
    options: [
      { label: "Abortion", labelNp: "गर्भपतन", value: "A" },
      {
        label: "Still birth",
        labelNp: "मृत बच्चा जन्मिएको",
        value: "S",
      },
      {
        label: "C-Section",
        labelNp: "शल्यक्रिया (अप्रेसन) गरेर बच्चा जन्माएको",
        value: "C",
      },
      {
        label: "Eclampsia/convulsion",
        labelNp: "गर्भावस्थामा बेहोस हुने वा काप्ने समस्या (Eclampsia)",
        value: "E",
      },
      {
        label: "Ante or post-partum haemorrhage",
        labelNp: "सुत्केरी हुनु अघि वा पछि धेरै रगत बगेको",
        value: "AP",
      },
      {
        label: "High blood pressure",
        labelNp: "उच्च रक्तचाप (High BP)",
        value: "H",
      },
      {
        label: "Diabetes",
        labelNp: "मधुमेह (चिनी रोग)",
        value: "D",
      },
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
    label: "Have you visited a health provider or health facility for ANC?",
    labelNp:
      "के तपाईंले गर्भ जाँच (ANC) को लागि स्वास्थ्यकर्मी वा स्वास्थ्य संस्थामा देखाउनुभयो?",
    type: "select",
    visibleIf: {
      dependsOn: "pregnantWomanQ3",
      value: "N",
    },
    options: [
      { label: "Yes", labelNp: "देखाएँ", value: "Y" },
      {
        label: "No",
        labelNp: "देखाएको छैन",
        value: "N",
      },
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
    visibleIfAll: [
      { dependsOn: "pregnantWomanQ3", value: "N" },
      { dependsOn: "pregnantWomanQ5", value: "Y" },
    ],
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

  // ---------- IRON-FOLATE ----------
  {
    key: "pregnantWomanQ7",
    label: "How many iron-folate tablets have you taken in last one month?",
    labelNp: "पछिल्लो एक महिनामा तपाईंले कतिवटा आइरन-फोलेट चक्की खानुभयो?",
    type: "text",
    keyboardType: "number-pad",
    placeholder: "e.g. 30",
    visibleIfAny: [
      { dependsOn: "pregnantWomanQ3", value: "Y" },
      { dependsOn: "pregnantWomanQ5", value: "Y" },
    ],
    validation: [
      {
        type: "required",
        message: "Please enter number of iron tablets",
      },
    ],
  },

  // ---------- CALCIUM ----------
  {
    key: "pregnantWomanQ8",
    label: "How many calcium tablets have you taken in last one month?",
    labelNp: "पछिल्लो एक महिनामा तपाईंले कतिवटा क्याल्सियम चक्की खानुभयो?",
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
    label: "Have you taken TT vaccination?",
    labelNp: "के तपाईंले टिटी (TT/Td) को सुई लगाउनुभयो?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "लगाएँ", value: "Y" },
      {
        label: "No",
        labelNp: "लगाएको छैन",
        value: "N",
      },
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
    label: "How many TT vaccinations have you received?",
    labelNp: "तपाईंले कति पटक टिटी (TT/Td) सुई लगाउनुभयो?",
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

  // ---------- BLOOD PRESSURE ----------
  {
    key: "pregnantWomanQ11",
    label:
      "Blood Pressure (mm of Hg) — If systolic is 140 or higher and/or diastolic is 90 or higher, refer to a health facility",
    labelNp:
      "रक्तचाप (ब्लड प्रेसर) — माथिल्लो १४० वा सोभन्दा बढी र/वा तल्लो ९० वा सोभन्दा बढी भएमा स्वास्थ्य संस्थामा पठाउने",
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

  // ---------- BLOOD GLUCOSE ----------
  {
    key: "pregnantWomanQ12",
    label:
      "Blood Glucose (mmol/L) — If random blood sugar is above 11.1, refer to a health facility",
    labelNp:
      "रगतमा चिनीको मात्रा (सुगर) — सुगर ११.१ भन्दा बढी भएमा स्वास्थ्य संस्थामा पठाउने",
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
      "Have you made a birth plan? (Which facility you will go to for delivery, saved money, had blood grouping done and had a blood donor ready)",
    labelNp:
      "के तपाईंले सुत्केरी हुने योजना (Birth Plan) बनाउनुभएको छ? (कुन अस्पताल जाने, पैसाको जोहो, रगतको समूह जाँच र रगत दिने मान्छे तयार पार्ने)",
    type: "select",
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      {
        label: "No → Advice to make a birth plan",
        labelNp: "छैन → सुत्केरी योजना बनाउन सल्लाह दिने",
        value: "N",
      },
    ],
    validation: [
      {
        type: "required",
        message: "Please select birth plan status",
      },
    ],
  },
];
