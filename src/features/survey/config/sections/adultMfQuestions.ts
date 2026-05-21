import { QuestionConfig } from "../../components/QuestionRenderer";

export const adultMfQuestions: QuestionConfig[] = [
  {
    key: "adultMfQ1",
    label: "Do you have any of the following health problems?",
    labelNp: "के तपाईंलाई तलका मध्ये कुनै स्वास्थ्य समस्या छ?",
    type: "checkbox",
    options: [
      { label: "Hypertension", labelNp: "उच्च रक्तचाप", value: "H" },
      { label: "Diabetes", labelNp: "मधुमेह", value: "D" },
      { label: "Heart disease", labelNp: "मुटु रोग", value: "E" },
      { label: "Asthma/chronic cough", labelNp: "दम वा खोकी", value: "A" },
      { label: "Tuberculosis", labelNp: "क्षयरोग", value: "T" },
      { label: "Cancer", labelNp: "क्यान्सर", value: "C" },
      { label: "Stroke", labelNp: "स्ट्रोक", value: "S" },
      { label: "Arthritis", labelNp: "बाथ", value: "U" },
      { label: "Kidney disease", labelNp: "मिर्गौला रोग", value: "K" },
      { label: "Liver disease", labelNp: "कलेजो रोग", value: "L" },
      { label: "Others", labelNp: "अन्य", value: "O" },
    ],
  },

  {
    key: "adultMfQ1Others",
    label: "Other health problem",
    labelNp: "अन्य समस्या (लेख्नुहोस्)",
    type: "text",
    visibleIf: {
      dependsOn: "adultMfQ1",
      operator: "includes",
      value: "O",
    },
    validation: [
      {
        type: "required",
        message: "Please specify the other health problem",
      },
    ],
  },

  {
    key: "adultMfQ2",
    label: "Are you taking medication for these?",
    labelNp: "के तपाईं यी रोगका लागि औषधि खाइरहनुभएको छ?",
    type: "select",
    visibleIf: {
      dependsOn: "adultMfQ1",
      operator: "notEmpty",
    },
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please select if you are taking medication",
      },
    ],
  },

  {
    key: "adultMfQ3",
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

  {
    key: "adultMfQ4",
    label: "Blood Glucose (mmol/L)",
    labelNp: "रगतमा चिनी",
    type: "text",
    keyboardType: "number-pad",
    placeholder: "e.g. 5.6",
    validation: [
      {
        type: "required",
        message: "Please enter glucose level",
      },
    ],
  },

  //  FIXED: checkbox instead of select
  {
    key: "adultMfQ5",
    label: "Which healthy habits do you practice?",
    labelNp: "तपाईं तलका स्वस्थ बानीहरू मध्ये कुन अपनाउनुहुन्छ?",
    type: "checkbox",
    options: [
      {
        label: "Avoid smoking/tobacco",
        labelNp: "धुम्रपान नगर्ने",
        value: "S",
      },
      { label: "Avoid extra salt", labelNp: "नुन कम खाने", value: "A" },
      { label: "Balanced diet", labelNp: "सन्तुलित खाना", value: "E" },
      { label: "Exercise", labelNp: "व्यायाम गर्ने", value: "D" },
    ],
  },
];
