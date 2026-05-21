import { QuestionConfig } from "../../components/QuestionRenderer";

export const maAdolescentMaQuestions: QuestionConfig[] = [
  {
    key: "maAdolescentMaQ1",
    label: "Are you or your partner using contraceptive method?",
    labelNp: "के तपाईं वा तपाईंको श्रीमतीले परिवार नियोजन प्रयोग गर्नुहुन्छ?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "गर्छौं", value: "Y" },
      { label: "No", labelNp: "गर्दैनौं", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "maAdolescentMaQ2",
    label: "Which method is used?",
    labelNp: "कुन साधन प्रयोग गर्नुहुन्छ?",
    type: "select",
    required: true,
    visibleIf: { dependsOn: "maAdolescentMaQ1", value: "Y" },
    options: [
      { label: "Pill", labelNp: "पिल्स", value: "P" },
      { label: "Condom", labelNp: "कण्डम", value: "C" },
      { label: "Implant", labelNp: "इम्पलान्ट", value: "M" },
      { label: "IUD", labelNp: "आईयूडी", value: "U" },
      { label: "Injection", labelNp: "सुई", value: "I" },
      { label: "Others", labelNp: "अन्य", value: "O" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "maAdolescentMaQ2Others",
    label: "Other method (specify)",
    labelNp: "अन्य (लेख्नुहोस्)",
    type: "text",
    visibleIf: { dependsOn: "maAdolescentMaQ2", value: "O" },
    required: true,
    validation: [{ type: "required", message: "Please specify" }],
  },

  // ---------- Symptoms ----------
  {
    key: "maAdolescentMaQ3",
    label: "Any of the following problems?",
    labelNp: "तलका मध्ये कुनै समस्या छ?",
    type: "checkbox",
    options: [
      { label: "Burning urine", labelNp: "पिसाब पोल्ने", value: "1" },
      { label: "Genital discharge", labelNp: "योनीबाट पानी/पीप", value: "2" },
      { label: "Genital sore/ulcer", labelNp: "घाउ/खटिरा", value: "3" },
      { label: "Abnormal growth", labelNp: "अस्वाभाविक मासु", value: "4" },
      {
        label: "Lower abdominal pain",
        labelNp: "तल्लो पेट दुख्ने",
        value: "5",
      },
    ],
  },

  {
    key: "maAdolescentMaQ4",
    label: "Visited health facility?",
    labelNp: "के स्वास्थ्य संस्था जानुभयो?",
    type: "select",
    visibleIf: {
      dependsOn: "maAdolescentMaQ3",
      operator: "notEmpty",
    },
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
    label: "Do you know these are harmful to health?",
    labelNp: "के तपाईंलाई तलका कुरा हानिकारक छन् भन्ने थाहा छ?",
    required: true,
    type: "checkbox",
    options: [
      { label: "Drug", labelNp: "लागुऔषध", value: "D" },
      { label: "Alcohol", labelNp: "रक्सी", value: "A" },
      { label: "Tobacco", labelNp: "सुर्तीजन्य पदार्थ", value: "T" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },
];
