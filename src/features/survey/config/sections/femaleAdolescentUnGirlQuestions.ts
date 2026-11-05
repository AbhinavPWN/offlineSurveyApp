import { QuestionConfig } from "../../components/QuestionRenderer";

export const feAdolescentUnQuestions: QuestionConfig[] = [
  {
    key: "feAdolescentUnQ1",
    label: "Do you take iron folic acid tablet every week?",
    labelNp:
      "के तपाईंले आफ्नो विद्यालयका सम्बन्धित स्वास्थ्य फोकल शिक्षकमार्फत हरेक हप्ता आइरन–फोलिक एसिड (IFA) चक्की प्राप्त गरी सेवन गर्नुभएको छ? (प्रत्येक वर्ष IFA दुई चरणमा १३–१३ हप्ताका लागि (प्रति हप्ता १ चक्की) प्रदान गरिन्छ: पहिलो चरण–श्रावणदेखि असोजसम्म र दोस्रो चरण–माघदेखि चैतसम्म।)",
    type: "select",
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
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
    label: "Have you taken deworming tablet in last 6 months?",
    labelNp: "के तपाईंले पछिल्लो ६ महिनामा जुकाको औषधि सेवन गर्नुभएको छ?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "खाएको छु", value: "Y" },
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
    label: "Has your menstruation started?",
    labelNp: "के तपाईंको महिनावारी (रजस्वला /पर सर्नु) सुरु भएको छ?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "भएको छ", value: "Y" },
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
    label: "What kind of menstrual product you use?",
    labelNp: "महिनावारी हुँदा तपाईंले कुन प्रकारको प्याड प्रयोग गर्नुहुन्छ?",
    type: "select",
    visibleIf: { dependsOn: "feAdolescentUnQ3", value: "Y" },
    options: [
      {
        label: "Disposable sanitary napkin",
        labelNp: "एकपटक मात्र प्रयोग गरी फाल्ने प्याड",
        value: "D",
      },
      {
        label: "Reusable sanitary napkin",
        labelNp: "धोएर फेरि प्रयोग गर्न मिल्ने कपडाको प्याड",
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
    labelNp: "तपाईंले प्रयोग गरेको प्याडको कसरी व्यवस्थापन गर्नुहुन्छ?",
    type: "select",
    visibleIf: { dependsOn: "feAdolescentUnQ4", value: "D" },
    options: [
      { label: "Burn it", labelNp: "जलाउने", value: "B" },
      { label: "Bury it", labelNp: "जमिनमुनि पुर्ने", value: "U" },
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
    labelNp:
      "तपाईंले प्रयोग गरेको पुनःप्रयोग गर्न मिल्ने प्याड कसरी धुनुहुन्छ?",
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
    labelNp: "तपाईंले यसलाई कसरी सुकाउनुहुन्छ?",
    type: "select",
    visibleIf: { dependsOn: "feAdolescentUnQ4", value: "R" },
    options: [
      { label: "In the sun", labelNp: "घाममा", value: "S" },
      {
        label: "In protected area away from sunlight",
        labelNp: "घाम नलाग्ने सुरक्षित ठाउँमा",
        value: "A",
      },
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
    key: "feAdolescentUnQ8Ans1",
    groupTitle: "Are you suffering from any of the following?",
    groupTitleNp: "तपाईंलाई हाल तलका मध्ये कुनै स्वास्थ्यसम्बन्धी समस्या छ?",
    label: "Burning urine",
    labelNp: "पिसाब गर्दा पोल्ने",
    type: "radio",
    compactChoices: true,
    required: true,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      { type: "required", message: "Please select Yes or No for this symptom" },
    ],
  },
  {
    key: "feAdolescentUnQ8Ans2",
    label: "Genital discharge (curdy/foul smelling/itchy)",
    labelNp: "योनीबाट असामान्य पानी बग्ने (सेतो, गन्हाउने वा चिलाउने)",
    type: "radio",
    compactChoices: true,
    required: true,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      { type: "required", message: "Please select Yes or No for this symptom" },
    ],
  },
  {
    key: "feAdolescentUnQ8Ans3",
    label: "Genital sore/ulcer",
    labelNp: "यौनाङ्गमा घाउ वा खटिरा हुने",
    type: "radio",
    compactChoices: true,
    required: true,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      { type: "required", message: "Please select Yes or No for this symptom" },
    ],
  },
  {
    key: "feAdolescentUnQ8Ans4",
    label: "Abnormal growth in genital area",
    labelNp: "यौनाङ्गमा अस्वाभाविक मासु पलाउने वा डल्लो आउने",
    type: "radio",
    compactChoices: true,
    required: true,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      { type: "required", message: "Please select Yes or No for this symptom" },
    ],
  },
  {
    key: "feAdolescentUnQ8Ans5",
    label: "Lower abdominal pain",
    labelNp: "पेटको तल्लो भाग दुख्ने",
    type: "radio",
    compactChoices: true,
    required: true,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      { type: "required", message: "Please select Yes or No for this symptom" },
    ],
  },

  {
    key: "feAdolescentUnQ9",
    label: "Have you visited health facility?",
    labelNp:
      "के तपाईं स्वास्थ्य जाँच वा उपचारका लागि स्वास्थ्य संस्थामा जानुभएको छ? (प्रश्न ३ को उत्तर ‘हो’ भएमा मात्र सोध्नुहोस्।)",
    type: "select",
    visibleIf: {
      dependsOn: "feAdolescentUnQ3",
      value: "Y",
    },
    options: [
      { label: "Yes", labelNp: "गएको छु", value: "Y" },
      { label: "No", labelNp: "गएको छैन", value: "N" },
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
    label: "Do you feel any of the following? (multiple choice)",
    labelNp:
      "के तपाईंलाई हाल तलका मध्ये कुनै समस्या वा परिवर्तन महसुस भइरहेको छ? (एकभन्दा बढी विकल्प रोज्न सकिन्छ।)",
    type: "checkbox",
    // visibleIf: {
    //   dependsOn: "feAdolescentUnQ9",
    //   value: "N",
    // },
    options: [
      {
        label: "Persistent unhappiness and avoid people or activities",
        labelNp:
          "सधैं उदास वा दुःखी रहने र मानिसहरू वा आफूलाई मन पर्ने गतिविधिबाट टाढा रहने",
        value: "1",
      },
      {
        label: "Constantly anxious, fearful, or tense without clear reason",
        labelNp: "बिना स्पष्ट कारण सधैं आत्तिने, डराउने वा तनाव महसुस हुने",
        value: "2",
      },
      {
        label:
          "Irritable, angry, confused, or acting very differently than before",
        labelNp:
          "छिट्टै झर्को लाग्ने, रिसाउने, अलमलिने वा पहिलेभन्दा फरक व्यवहार गर्ने",
        value: "3",
      },
      {
        label: "Trouble working or maintaining personal hygiene",
        labelNp:
          "दैनिक काम गर्न गाह्रो हुने वा व्यक्तिगत सरसफाइमा ध्यान दिन नसक्ने",
        value: "4",
      },
      {
        label:
          "Sleeping too much or too little; eating much less or much more than usual",
        labelNp: "धेरै वा कम सुत्ने तथा सामान्यभन्दा धेरै वा कम खाने",
        value: "5",
      },
    ],
  },
];
