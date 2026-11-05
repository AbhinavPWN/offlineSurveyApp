import { QuestionConfig } from "../../components/QuestionRenderer";

export const maAdolescentMaQuestions: QuestionConfig[] = [
  {
    key: "maAdolescentMaQ1",
    label: "Q1. Are you or your partner using any contraceptive method?",
    labelNp:
      "के तपाईं वा तपाईंको श्रीमतीले परिवार नियोजनको कुनै साधन प्रयोग गर्नुहुन्छ?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "गर्छु/गर्छौं", value: "Y" },
      { label: "No", labelNp: "गर्दिनँ/गर्दैनौं", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "maAdolescentMaQ2",
    label: "Q2. What kind of method it is?",
    labelNp: "कुन प्रकारको साधन प्रयोग गर्नुहुन्छ?",
    type: "select",
    required: true,
    visibleIf: { dependsOn: "maAdolescentMaQ1", value: "Y" },
    options: [
      { label: "Pill", labelNp: "पिल्स (चक्की)", value: "P" },
      { label: "Condom", labelNp: "कण्डम", value: "C" },
      { label: "Implant", labelNp: "इम्पलान्ट", value: "M" },
      { label: "IUD", labelNp: "आई.यू.डी.", value: "U" },
      { label: "Injection", labelNp: "सुई (डिपो)", value: "I" },
      { label: "Others", labelNp: "अन्य", value: "O" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "maAdolescentMaQ2Others",
    label: "Other method (specify)",
    labelNp: "अन्य (लेख्नुहोस्)",
    type: "text",
    visibleIfAll: [
      { dependsOn: "maAdolescentMaQ1", value: "Y" },
      { dependsOn: "maAdolescentMaQ2", value: "O" },
    ],
    required: true,
    validation: [{ type: "required", message: "Please specify" }],
  },

  // ---------- Symptoms ----------
  {
    key: "maAdolescentMaQ3Ans1",
    groupTitle:
      "Q3. Are you or your partner suffering from any of the following?",
    groupTitleNp: "के तपाईं वा तपाईंको श्रीमतीलाई तलका मध्ये कुनै समस्या छ?",
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
    key: "maAdolescentMaQ3Ans2",
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
    key: "maAdolescentMaQ3Ans3",
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
    key: "maAdolescentMaQ3Ans4",
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
    key: "maAdolescentMaQ3Ans5",
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
    key: "maAdolescentMaQ4",
    label:
      "Q4. Have you/or your partner visited health facility? (Ask if any Q3 answer is Yes)",
    labelNp:
      "के तपाईं वा तपाईंको श्रीमती जचाउन स्वास्थ्य संस्था जानुभयो? (प्रश्न ३ को कुनै पनि उत्तर ‘छ’ भएमा मात्र सोध्नुहोस्।)",
    type: "select",
    visibleIfAny: [
      { dependsOn: "maAdolescentMaQ3Ans1", value: "Y" },
      { dependsOn: "maAdolescentMaQ3Ans2", value: "Y" },
      { dependsOn: "maAdolescentMaQ3Ans3", value: "Y" },
      { dependsOn: "maAdolescentMaQ3Ans4", value: "Y" },
      { dependsOn: "maAdolescentMaQ3Ans5", value: "Y" },
    ],
    options: [
      { label: "Yes", labelNp: "गयौं", value: "Y" },
      { label: "No", labelNp: "गएनौं", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please select whether you visited a health facility",
      },
    ],
  },

  // ---------- Awareness ----------
  {
    key: "maAdolescentMaQ5",
    label: "Q5. Do you know the following things are harmful to health?",
    labelNp:
      "के तपाईंलाई तलका कुराहरू स्वास्थ्यका लागि हानिकारक छन् भन्ने थाहा छ?",
    required: true,
    type: "checkbox",
    options: [
      { label: "Drug", labelNp: "लागुऔषध", value: "D" },
      { label: "Alcohol", labelNp: "रक्सी", value: "A" },
      {
        label: "Tobacco",
        labelNp: "सुर्तीजन्य पदार्थ (चुरोट, खैनी आदि)",
        value: "T",
      },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },
];
