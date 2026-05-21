import { QuestionConfig } from "../../components/QuestionRenderer";

export const feAdolescentMaQuestions: QuestionConfig[] = [
  {
    key: "feAdolescentMaQ1",
    label: "Do you take iron folic acid tablet every week?",
    labelNp: "के तपाईं हरेक हप्ता आइरन फोलिक एसिड चक्की लिनुहुन्छ?",
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
    label: "Taken deworming tablet in last 6 months?",
    labelNp: "के तपाईंले पछिल्लो ६ महिनामा जुकाको औषधि खानुभएको छ?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
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
    label: "What menstrual product do you use?",
    labelNp: "महिनावारी हुँदा के प्रयोग गर्नुहुन्छ?",
    type: "select",
    options: [
      {
        label: "Disposable sanitary napkin",
        labelNp: "एकपटक प्रयोग गर्ने प्याड",
        value: "D",
      },
      {
        label: "Reusable sanitary napkin",
        labelNp: "धोएर प्रयोग गर्ने",
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
    labelNp: "प्रयोग गरेको प्याडलाई कसरी फाल्नुहुन्छ?",
    type: "select",
    visibleIf: { dependsOn: "feAdolescentMaQ3", value: "D" },
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
    key: "feAdolescentMaQ5",
    label: "How do you wash reusable pad?",
    labelNp: "यसलाई कसरी धुनुहुन्छ?",
    type: "select",
    visibleIf: { dependsOn: "feAdolescentMaQ3", value: "R" },
    options: [
      { label: "Water only", labelNp: "पानीले मात्र", value: "W" },
      { label: "Soap and water", labelNp: "साबुन र पानी", value: "S" },
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
    label: "How do you dry reusable pad?",
    labelNp: "यसलाई कसरी सुकाउनुहुन्छ?",
    type: "select",
    visibleIf: { dependsOn: "feAdolescentMaQ3", value: "R" },
    options: [
      { label: "In the sun", labelNp: "घाममा", value: "S" },
      { label: "Protected area", labelNp: "घाम नलाग्ने ठाउँ", value: "A" },
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
    label: "Are you or your partner using contraceptive method?",
    labelNp:
      "के तपाईं वा तपाईंको श्रीमान परिवार नियोजन प्रयोग गर्दै हुनुहुन्छ?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "गर्छौं", value: "Y" },
      { label: "No", labelNp: "गर्दैनौं", value: "N" },
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
    label: "Which method is used?",
    labelNp: "कुन साधन प्रयोग गर्नुहुन्छ?",
    type: "select",
    visibleIf: { dependsOn: "feAdolescentMaQ7", value: "Y" },
    options: [
      { label: "Pill", labelNp: "पिल्स", value: "P" },
      { label: "Condom", labelNp: "कण्डम", value: "C" },
      { label: "Implant", labelNp: "इम्पलान्ट", value: "M" },
      { label: "IUD", labelNp: "आईयूडी", value: "U" },
      { label: "Injection", labelNp: "सुई", value: "I" },
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
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
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
    label: "Have you received antenatal care?",
    labelNp: "के तपाईंले प्रसवपूर्व हेरचाह पाउनुभएको छ?",
    type: "select",
    visibleIf: { dependsOn: "feAdolescentMaQ9", value: "Y" },
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
    label: "Number of antenatal visits",
    labelNp: "कति पटक प्रसवपूर्व जाँच गर्नुभयो?",
    type: "text",
    keyboardType: "number-pad",
    placeholder: "Enter number",
    visibleIf: { dependsOn: "feAdolescentMaQ10", value: "Y" },
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
    key: "feAdolescentMaQ12",
    label: "Are you or your partner suffering from any of the following?",
    labelNp: "के तपाईं वा तपाईंको श्रीमानलाई तलका मध्ये कुनै समस्या छ?",
    type: "checkbox",
    options: [
      { label: "Burning urine", labelNp: "पिसाब पोल्ने", value: "1" },
      {
        label: "Genital discharge",
        labelNp: "यौनाङ्गबाट पानी वा पीप बग्ने - गन्हाउने/चिलाउने ",
        value: "2",
      },
      { label: "Genital sore", labelNp: "घाउ", value: "3" },
      { label: "Abnormal growth", labelNp: "अस्वाभाविक मासु", value: "4" },
      {
        label: "Lower abdominal pain",
        labelNp: "तल्लो पेट दुख्ने",
        value: "5",
      },
    ],
  },

  {
    key: "feAdolescentMaQ13",
    label: "Visited health facility?",
    labelNp: "के स्वास्थ्य संस्था जानुभयो?",
    type: "select",
    visibleIf: {
      dependsOn: "feAdolescentMaQ12",
      operator: "notEmpty",
    },
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
