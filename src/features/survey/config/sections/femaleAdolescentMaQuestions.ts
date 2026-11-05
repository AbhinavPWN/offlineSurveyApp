import { QuestionConfig } from "../../components/QuestionRenderer";

export const feAdolescentMaQuestions: QuestionConfig[] = [
  {
    key: "feAdolescentMaQ1",
    label: "Do you take iron folic acid tablet every week?",
    labelNp:
      "के तपाईंले आफ्नो विद्यालयका सम्बन्धित स्वास्थ्य फोकल शिक्षकमार्फत हरेक हप्ता आइरन–फोलिक एसिड (IFA) चक्की प्राप्त गरी सेवन गर्नुभएको छ?",
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
    key: "feAdolescentMaQ2",
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

  // ---------- MENSTRUAL ----------

  {
    key: "feAdolescentMaQ3",
    label: "What kind of menstrual product you use?",
    labelNp: "महिनावारी हुँदा तपाईंले कुन प्रकारको प्याड प्रयोग गर्नुहुन्छ?",
    type: "select",
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
    key: "feAdolescentMaQ4",
    label: "How do you dispose sanitary napkin?",
    labelNp: "तपाईंले प्रयोग गरेको प्याडको कसरी व्यवस्थापन गर्नुहुन्छ?",
    type: "select",
    visibleIf: { dependsOn: "feAdolescentMaQ3", value: "D" },
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
    key: "feAdolescentMaQ5",
    label: "How do you wash it?",
    labelNp:
      "तपाईंले प्रयोग गरेको पुनःप्रयोग गर्न मिल्ने प्याड कसरी धुनुहुन्छ?",
    type: "select",
    visibleIf: { dependsOn: "feAdolescentMaQ3", value: "R" },
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
    key: "feAdolescentMaQ6",
    label: "How do you dry it?",
    labelNp: "तपाईंले यसलाई कसरी सुकाउनुहुन्छ?",
    type: "select",
    visibleIf: { dependsOn: "feAdolescentMaQ3", value: "R" },
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

  // ---------- FAMILY PLANNING ----------

  {
    key: "feAdolescentMaQ7",
    label: "Are you or your partner using any contraceptive method?",
    labelNp:
      "के तपाईं वा तपाईंको श्रीमानले कुनै परिवार नियोजनको साधन प्रयोग गर्दै हुनुहुन्छ?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "गर्छु/गर्छौं", value: "Y" },
      { label: "No", labelNp: "गर्दिनँ/गर्दैनौं", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please confirm if contraceptive method is being used",
      },
    ],
  },

  {
    key: "feAdolescentMaQ8",
    label: "What kind of method it is?",
    labelNp: "कुन प्रकारको साधन प्रयोग गर्नुहुन्छ?",
    type: "select",
    visibleIf: { dependsOn: "feAdolescentMaQ7", value: "Y" },
    options: [
      { label: "Pill", labelNp: "पिल्स (चक्की)", value: "P" },
      { label: "Condom", labelNp: "कण्डम", value: "C" },
      { label: "Implant", labelNp: "इम्पलान्ट", value: "M" },
      { label: "IUD", labelNp: "आई.यू.डी.", value: "U" },
      { label: "Injection", labelNp: "सुई (डिपो)", value: "I" },
      { label: "Others", labelNp: "अन्य", value: "O" },
    ],
    validation: [
      {
        type: "required",
        message: "Please select the contraceptive method used",
      },
    ],
  },

  // ---------- PREGNANCY ----------

  {
    key: "feAdolescentMaQ9",
    label: "Are you pregnant?",
    labelNp: "के तपाईं गर्भवती हुनुहुन्छ?",
    type: "select",
    visibleIf: { dependsOn: "feAdolescentMaQ7", value: "N" },
    options: [
      { label: "Yes", labelNp: "छु", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please confirm if you are pregnant",
      },
    ],
  },

  {
    key: "feAdolescentMaQ10",
    label: "Have you received any antenatal care?",
    labelNp: "के तपाईंले (गर्भावस्थाको समय) प्रसवपूर्व हेरचाह पाउनुभएको छ?",
    type: "select",
    visibleIfAll: [
      { dependsOn: "feAdolescentMaQ7", value: "N" },
      { dependsOn: "feAdolescentMaQ9", value: "Y" },
    ],
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please confirm if antenatal care was received",
      },
    ],
  },

  {
    key: "feAdolescentMaQ11",
    label: "How many antenatal care you have received?",
    labelNp: "तपाईंले कति पटक हेरचाह प्राप्त गर्नुभएको छ?",
    type: "text",
    keyboardType: "number-pad",
    placeholder: "पटक (संख्या) ........",
    visibleIfAll: [
      { dependsOn: "feAdolescentMaQ7", value: "N" },
      { dependsOn: "feAdolescentMaQ9", value: "Y" },
      { dependsOn: "feAdolescentMaQ10", value: "Y" },
    ],
    validation: [
      {
        type: "required",
        message: "Please enter number of antenatal visits",
      },
      {
        type: "pattern",
        value: /^[0-9]+$/, //  numeric validation
        message: "Only numbers are allowed",
      },
    ],
  },

  // ---------- SYMPTOMS ----------

  {
    key: "feAdolescentMaQ12Ans1",
    groupTitle:
      "Q12. Are you or your partner suffering from any of the following?",
    groupTitleNp: "के तपाईं वा तपाईंको श्रीमानलाई तलका मध्ये कुनै समस्या छ?",
    label: "Burning urine",
    labelNp: "पिसाब पोल्ने",
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
    key: "feAdolescentMaQ12Ans2",
    label: "Genital discharge (curdy/foul smelling/itchy)",
    labelNp: "यौनाङ्गबाट पानी वा पीप बग्ने (गन्हाउने/चिलाउने)",
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
    key: "feAdolescentMaQ12Ans3",
    label: "Genital sore/ulcer",
    labelNp: "यौनाङ्गमा घाउ वा खटिरा",
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
    key: "feAdolescentMaQ12Ans4",
    label: "Abnormal growth in genital area",
    labelNp: "यौनाङ्गमा अस्वाभाविक मासु पलाएको वा डल्लो",
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
    key: "feAdolescentMaQ12Ans5",
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
    key: "feAdolescentMaQ13",
    label: "Have you/or your partner visited health facility?",
    labelNp:
      "के तपाईं वा तपाईंको श्रीमान् जचाउन स्वास्थ्य संस्था जानुभयो? (प्रश्न १२ को कुनै पनि उत्तर ‘छ’ भएमा मात्र सोध्नुहोस्।)",
    type: "select",
    visibleIfAny: [
      { dependsOn: "feAdolescentMaQ12Ans1", value: "Y" },
      { dependsOn: "feAdolescentMaQ12Ans2", value: "Y" },
      { dependsOn: "feAdolescentMaQ12Ans3", value: "Y" },
      { dependsOn: "feAdolescentMaQ12Ans4", value: "Y" },
      { dependsOn: "feAdolescentMaQ12Ans5", value: "Y" },
    ],
    options: [
      { label: "Yes", labelNp: "गयौं", value: "Y" },
      { label: "No", labelNp: "गएनौं", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please confirm if health facility was visited",
      },
    ],
  },
];
