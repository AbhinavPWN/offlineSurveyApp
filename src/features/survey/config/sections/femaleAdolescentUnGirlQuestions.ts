import { QuestionConfig } from "../../components/QuestionRenderer";

export const feAdolescentUnQuestions: QuestionConfig[] = [
  {
    key: "feAdolescentUnQ1",
    label: "Do you take iron folic acid tablet every week?",
    labelNp: "के तिमी हरेक हप्ता आइरन फोलिक एसिड चक्की खान्छौ?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "खान्छु", value: "Y" },
      { label: "No", labelNp: "खान्न", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please confirm if you take iron folic acid tablet weekly",
      },
    ],
  },

  {
    key: "feAdolescentUnQ2",
    label: "Have you Taken deworming tablet in last 6 months?",
    labelNp: "के तिमीले पछिल्लो ६ महिनामा जुकाको औषधि खाएकी छौ?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "खाएको छ", value: "Y" },
      { label: "No", labelNp: "खाएको छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message:
          "Please confirm if deworming tablet was taken in last 6 months",
      },
    ],
  },

  {
    key: "feAdolescentUnQ3",
    label: "Has menstruation started?",
    labelNp: "के तिम्रो महिनावारी सुरु भयो?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "भयो", value: "Y" },
      { label: "No", labelNp: "भएको छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please confirm if menstruation has started",
      },
    ],
  },

  // ---------- MENSTRUAL ----------

  {
    key: "feAdolescentUnQ4",
    label: "What menstrual product do you use?",
    labelNp: "महिनावारी हुँदा तिमी के प्रयोग गर्छौ?",
    type: "select",
    visibleIf: { dependsOn: "feAdolescentUnQ3", value: "Y" },
    options: [
      {
        label: "Disposable sanitary napkin",
        labelNp: "एकपटक प्रयोग गर्ने प्याड",
        value: "D",
      },
      {
        label: "Reusable sanitary napkin",
        labelNp: "धोएर प्रयोग गर्ने कपडा प्याड",
        value: "R",
      },
    ],
    validation: [
      {
        type: "required",
        message: "Please select the type of menstrual product used",
      },
    ],
  },

  {
    key: "feAdolescentUnQ5",
    label: "How do you dispose sanitary napkin?",
    labelNp: "प्रयोग गरेको प्याडलाई कसरी फाल्छौ?",
    type: "select",
    visibleIf: { dependsOn: "feAdolescentUnQ4", value: "D" },
    options: [
      { label: "Burn it", labelNp: "जलाउने", value: "B" },
      { label: "Bury it", labelNp: "पुर्ने", value: "U" },
      { label: "Throw into garbage", labelNp: "फोहोरमा फाल्ने", value: "T" },
    ],
    validation: [
      {
        type: "required",
        message: "Please select how sanitary napkin is disposed",
      },
    ],
  },

  {
    key: "feAdolescentUnQ6",
    label: "How do you wash it?",
    labelNp: "यसलाई कसरी धुन्छौ?",
    type: "select",
    visibleIf: { dependsOn: "feAdolescentUnQ4", value: "R" },
    options: [
      { label: "Water only", labelNp: "पानीले मात्र", value: "W" },
      { label: "Soap and water", labelNp: "साबुन र पानीले", value: "S" },
    ],
    validation: [
      {
        type: "required",
        message: "Please select how reusable pad is washed",
      },
    ],
  },

  {
    key: "feAdolescentUnQ7",
    label: "How do you dry it?",
    labelNp: "यसलाई कसरी सुकाउँछौ?",
    type: "select",
    visibleIf: { dependsOn: "feAdolescentUnQ4", value: "R" },
    options: [
      { label: "In the sun", labelNp: "घाममा", value: "S" },
      { label: "Protected area", labelNp: "घाम नलाग्ने ठाउँमा", value: "A" },
    ],
    validation: [
      {
        type: "required",
        message: "Please select how reusable pad is dried",
      },
    ],
  },

  // ---------- SYMPTOMS ----------

  {
    key: "feAdolescentUnQ8",
    label: "Are you suffering from any of the following?",
    labelNp: "के तिमीलाई तलका मध्ये कुनै समस्या छ?",
    type: "checkbox",
    options: [
      { label: "Burning urine", labelNp: "पिसाब पोल्ने", value: "1" },
      { label: "Genital discharge", labelNp: "योनीबाट पानी बग्ने", value: "2" },
      { label: "Genital sore/ulcer", labelNp: "यौनाङ्गमा घाउ", value: "3" },
      { label: "Abnormal growth", labelNp: "अस्वाभाविक मासु", value: "4" },
      { label: "Lower abdominal pain", labelNp: "पेट दुख्ने", value: "5" },
    ],
  },

  {
    key: "feAdolescentUnQ9",
    label: "Visited health facility?",
    labelNp: "के तिमी स्वास्थ्य संस्थामा गयौ?",
    type: "select",
    visibleIf: {
      dependsOn: "feAdolescentUnQ8",
      operator: "notEmpty",
    },
    options: [
      { label: "Yes", labelNp: "गएँ", value: "Y" },
      { label: "No", labelNp: "गइनँ", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please confirm if you visited a health facility",
      },
    ],
  },

  {
    key: "feAdolescentUnQ10",
    label: "Do you feel any of the following?",
    labelNp: "के तिमीलाई तलका मध्ये कुनै महसुस हुन्छ?",
    type: "checkbox",
    // visibleIf: {
    //   dependsOn: "feAdolescentUnQ9",
    //   value: "N",
    // },
    options: [
      {
        label: "Persistent unhappiness and avoid people or activities",
        labelNp: "सधैं दुखी भइरहने र मानिसहरू वा क्रियाकलापबाट टाढा रहने ",
        value: "1",
      },
      {
        label: "Constantly anxious, fearful, or tense without clear reason",
        labelNp: "बिना कारण सधैं आत्तिने, डराउने वा तनाव हुने",
        value: "2",
      },
      {
        label:
          "Irritable, angry, confused, or acting very differently than before",
        labelNp:
          "झर्को लाग्ने, रिसाउने, झुक्किने वा पहिलेभन्दा फरक व्यवहार गर्ने",
        value: "3",
      },
      {
        label: "Trouble working or maintaining personal hygiene",
        labelNp: " काम गर्न गाह्रो हुने वा आफ्नो सरसफाइमा ध्यान दिन नसक्ने",
        value: "4",
      },
      {
        label:
          "Sleeping too much or too little; eating much less or much more than usual",
        labelNp:
          "धेरै निन्द्रा लाग्ने वा फिटिक्कै नलाग्ने; धेरै खाने वा थोरै खाने",
        value: "5",
      },
    ],
  },
];
