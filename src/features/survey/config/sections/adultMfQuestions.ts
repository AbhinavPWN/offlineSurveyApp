import { QuestionConfig } from "../../components/QuestionRenderer";

export const adultMfQuestions: QuestionConfig[] = [
  {
    key: "adultMfQ1",
    label:
      "Do you have any one of the following health problems? (Multiple choice)",
    labelNp:
      "के तपाईंलाई तलका मध्ये कुनै स्वास्थ्य समस्या छ? (धेरै रोज्न मिल्ने)",
    type: "checkbox",
    options: [
      {
        label: "Hypertension",
        labelNp: "उच्च रक्तचाप",
        value: "H",
      },
      {
        label: "Diabetes",
        labelNp: "मधुमेह (चिनी रोग/Sugar)",
        value: "D",
      },
      {
        label: "Heart disease",
        labelNp: "मुटु सम्बन्धी रोग",
        value: "E",
      },
      {
        label: "Asthma/chronic cough",
        labelNp: "दम वा धेरै समयदेखिको खोकी",
        value: "A",
      },
      {
        label: "Tuberculosis",
        labelNp: "क्षयरोग (T.B.)",
        value: "T",
      },
      {
        label: "Cancer",
        labelNp: "क्यान्सर",
        value: "C",
      },
      {
        label: "Stroke",
        labelNp: "मस्तिष्कघात (स्ट्रोक)",
        value: "S",
      },
      {
        label: "Arthritis",
        labelNp: "बाथ रोग (जोर्नी दुख्ने)",
        value: "U",
      },
      {
        label: "Kidney disease",
        labelNp: "मिर्गौला सम्बन्धी रोग",
        value: "K",
      },
      {
        label: "Liver disease",
        labelNp: "कलेजो सम्बन्धी रोग",
        value: "L",
      },
      {
        label: "Others",
        labelNp: "अन्य",
        value: "O",
      },
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
    label: "Are you taking any medication for those conditions?",
    labelNp: "के तपाईंले माथि उल्लेखित रोगका लागि कुनै औषधि खाइरहनुभएको छ?",
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

  {
    key: "adultMfQ4",
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
        message: "Please enter glucose level",
      },
    ],
  },

  {
    key: "adultMfQ5",
    label: "Do you practice the following healthy habits?",
    labelNp: "के तपाईंले तलका स्वस्थ बानीहरू अपनाउनुहुन्छ?",
    type: "checkbox",
    options: [
      {
        label: "Avoid smoking/tobacco",
        labelNp: "धुम्रपान वा सुर्तीजन्य पदार्थ नखानु वा छोड्नु",
        value: "S",
      },
      {
        label: "Avoid extra salt",
        labelNp: "थप नुन (काँचो नुन) कम खानु",
        value: "A",
      },
      {
        label: "Eat balanced diet",
        labelNp: "सन्तुलित र स्वस्थ खाना खानु",
        value: "E",
      },
      {
        label: "Do exercise/physical work",
        labelNp: "व्यायाम वा शारीरिक श्रम गर्नु",
        value: "D",
      },
    ],
  },
];
