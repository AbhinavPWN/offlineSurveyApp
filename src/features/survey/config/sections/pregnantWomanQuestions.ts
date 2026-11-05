import { QuestionConfig } from "../../components/QuestionRenderer";

export const pregnantWomanQuestions: QuestionConfig[] = [
  // ---------- LMP ----------
  {
    key: "pregnantWomanQ1",
    label: "Date of your last menstruation (LMP)",
    labelNp: "तपाईंको अन्तिम महिनावारी भएको मिति (LMP) कहिले हो?",
    type: "text",
    inputFormat: "bs-date",
    dayFirstDisplay: true,
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
    labelNp: "तपाईंको प्रसव हुने अनुमानित मिति (EDD) कहिले हो?",
    type: "text",
    inputFormat: "bs-date",
    dayFirstDisplay: true,
    readonly: true,
    keyboardType: "number-pad",
    placeholder: "Auto-calculated",
  },

  // ---------- FIRST PREGNANCY ----------
  {
    key: "pregnantWomanQ3",
    label: "Is this your first pregnancy?",
    labelNp: "के यो तपाईंको पहिलो गर्भावस्था हो?",
    type: "select",
    options: [
      {
        label: "Yes",
        labelNp: "हो",
        value: "Y",
      },
      { label: "No", labelNp: "होइन", value: "N" },
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
      "तपाईंको अघिल्लो गर्भावस्थामा निम्नमध्ये कुनै अवस्था भएको थियो? (लागू हुने सबै विकल्पमा ✓ चिन्ह लगाउनुहोस्।)",
    type: "checkbox",
    visibleIf: {
      dependsOn: "pregnantWomanQ3",
      operator: "equals",
      value: "N",
    },
    options: [
      { label: "Abortion/MR", labelNp: "गर्भपतन/एम.आर.", value: "A" },
      {
        label: "Still birth",
        labelNp: "मृत शिशु जन्म",
        value: "S",
      },
      {
        label: "C-Section",
        labelNp: "शल्यक्रियामार्फत सुत्केरी (C-Section)",
        value: "C",
      },
      {
        label: "Eclampsia/Pre-eclampsia/Convulsion",
        labelNp: "एक्लाम्पसिया/प्रि-एक्लाम्पसिया/झट्का लाग्नु",
        value: "E",
      },
      {
        label: "Ante or post-partum hemorrhage",
        labelNp: "गर्भावस्थाको समयमा वा प्रसवपछि अत्यधिक रक्तस्राव",
        value: "AP",
      },
      {
        label: "High blood pressure",
        labelNp: "उच्च रक्तचाप",
        value: "H",
      },
      {
        label: "Diabetes",
        labelNp: "मधुमेह",
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
    visibleIfAll: [
      { dependsOn: "pregnantWomanQ3", value: "N" },
      { dependsOn: "pregnantWomanQ4", operator: "includes", value: "O" },
    ],
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
      "के तपाईंले गर्भावस्थाको जाँच (ANC) का लागि स्वास्थ्यकर्मी वा स्वास्थ्य संस्थामा जानुभएको छ?",
    type: "select",
    visibleIf: {
      dependsOn: "pregnantWomanQ3",
      value: "N",
    },
    options: [
      { label: "Yes", labelNp: "छु", value: "Y" },
      {
        label: "No",
        labelNp: "छैनँ",
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
    label: "When have you visited?",
    labelNp: "तपाईं स्वास्थ्यकर्मी वा स्वास्थ्य संस्थामा कहिले जानुभएको थियो?",
    type: "text",
    inputFormat: "bs-date",
    dayFirstDisplay: true,
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
    labelNp:
      "पछिल्लो एक महिनामा तपाईंले कति वटा आइरन–फोलिक एसिडका चक्की सेवन गर्नुभएको छ?",
    type: "text",
    keyboardType: "number-pad",
    placeholder: "e.g. 30",
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
    labelNp:
      "पछिल्लो एक महिनामा तपाईंले कति वटा क्याल्सियमका चक्की सेवन गर्नुभएको छ?",
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
    labelNp: "के तपाईंले टिटानस टक्सोइड (TT) खोप लगाउनुभएको छ?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "छु", value: "Y" },
      {
        label: "No",
        labelNp: "छैनँ",
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
    labelNp: "तपाईंले कति पटक TT खोप लगाउनुभएको छ?",
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
    // Local visibility confirmation; not an API payload field.
    key: "pregnantWomanBpMeasuredByNhf",
    label: "Was blood pressure measured by NHF?",
    labelNp: "के NHF ले रक्तचाप मापन गरेको छ?",
    type: "radio",
    compactChoices: true,
    required: true,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please confirm whether NHF performed this measurement",
      },
    ],
  },

  {
    key: "pregnantWomanQ11",
    label:
      "Blood Pressure (mm of Hg) — Applies only if NHF measured blood pressure. If systolic is 140 or higher and/or diastolic is 90 or higher, refer to a health facility",
    labelNp:
      "रक्तचाप (mm of Hg) — NHF ले मापन गरेमा मात्र लागू हुन्छ। माथिल्लो १४० वा सोभन्दा बढी र/वा तल्लो ९० वा सोभन्दा बढी भएमा स्वास्थ्य संस्थामा पठाउने",
    type: "text",
    visibleIf: { dependsOn: "pregnantWomanBpMeasuredByNhf", value: "Y" },
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
    // Local visibility confirmation; not an API payload field.
    key: "pregnantWomanSugarMeasuredByNhf",
    label: "Was blood sugar measured by NHF?",
    labelNp: "के NHF ले रक्तमा चिनीको मात्रा मापन गरेको छ?",
    type: "radio",
    compactChoices: true,
    required: true,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please confirm whether NHF performed this measurement",
      },
    ],
  },

  {
    key: "pregnantWomanQ12",
    label:
      "Blood Sugar (mmol/L) — Applies only if NHF measured blood sugar. If random blood sugar is 11.1 or higher, refer to a health facility",
    labelNp:
      "रक्तमा चिनीको मात्रा (mmol/L) — NHF ले मापन गरेमा मात्र लागू हुन्छ। रगतमा चिनीको मात्रा ≥११.१ एमएमओएल/लिटर भएमा स्वास्थ्य संस्थामा सिफारिस गर्नुहोस्।",
    type: "text",
    visibleIf: { dependsOn: "pregnantWomanSugarMeasuredByNhf", value: "Y" },
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
      "Have you made a birth plan? (Includes place to deliver, saving money, having blood grouping done and having a blood donor ready)",
    labelNp:
      "के तपाईंले जन्म योजना बनाउनुभएको छ? (डेलिभरी गर्ने ठाउँ, पैसा बचत गर्ने, रक्त समूह निर्धारण गर्ने र रक्तदाता तयार राख्ने समावेश छ)",
    type: "select",
    options: [
      { label: "Yes", labelNp: "छु", value: "Y" },
      {
        label: "No → Advice to make a birth plan",
        labelNp: "छैनँ → उनीलाई जन्म योजना बनाउन सल्लाह दिनुहोस्।",
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
