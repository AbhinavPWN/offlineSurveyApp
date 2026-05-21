import { QuestionConfig } from "../../components/QuestionRenderer";

export const socialProtectionWomenQuestions: QuestionConfig[] = [
  // ---------- Q1 ----------
  {
    key: "socialProtectionWomenQ1",
    type: "radio",
    label: "Are you currently enrolled in any social protection program?",

    labelNp:
      "के तपाईं हाल सरकारको कुनै सामाजिक सुरक्षा कार्यक्रम वा भत्ता योजनामा आबद्ध हुनुहुन्छ?",

    required: true,

    options: [
      {
        label: "Yes",
        labelNp: "छ",
        value: "Y",
      },
      {
        label: "No",
        labelNp: "छैन",
        value: "N",
      },
    ],
  },

  // ---------- Q2 ----------
  {
    key: "socialProtectionWomenQ2",
    type: "checkbox",
    label: "Type of social protection program (Select all that apply)",
    labelNp:
      "तपाईंले कुन-कुन प्रकारका सुविधाहरू वा भत्ता पाइरहनुभएको छ? (एकभन्दा बढी छान्न मिल्ने)",

    required: true,
    visibleIf: {
      dependsOn: "socialProtectionWomenQ1",
      value: "Y",
    },

    options: [
      {
        label: "Old Age Allowance (OAA)",
        labelNp: "ज्येष्ठ नागरिक भत्ता",
        value: "1",
      },
      {
        label: "Single/Widow Woman Allowance",
        labelNp: "एकल महिला / बिधवा भत्ता",
        value: "2",
      },
      {
        label: "Disability Allowance",
        labelNp: "अपाङ्गता भत्ता",
        value: "3",
      },
      {
        label: "Government Health Insurance",
        labelNp: "सरकारी स्वास्थ्य बीमा",
        value: "4",
      },
      {
        label: "Prime Minister Employment Program",
        labelNp: "प्रधानमन्त्री रोजगार कार्यक्रम",
        value: "5",
      },

      {
        label: "Ethnicity-based Allowance",
        labelNp: "दलित / लोपोन्मुख जाति भत्ता",
        value: "6",
      },

      {
        label: "Safe Motherhood Program",
        labelNp: "सुरक्षित मातृत्व सेवा",
        value: "7",
      },

      {
        label: "Educational Scholarship",
        labelNp: "शैक्षिक छात्रवृत्ति",
        value: "8",
      },
      {
        label: "People's Housing Program",
        labelNp: "जनता आवास कार्यक्रम",
        value: "9",
      },

      {
        label: "Other",
        labelNp: "अन्य",
        value: "10",
      },
    ],

    validation: [
      {
        type: "minSelections",
        value: 1,
        message: "Select at least one program",
      },
    ],
  },

  // ---------- Q2 OTHERS ----------
  {
    key: "socialProtectionWomenQ2Others",
    type: "text",
    label: "Specify other program",
    labelNp: "अन्य सरकारी योजना उल्लेख गर्नुहोस्",

    visibleIf: {
      dependsOn: "socialProtectionWomenQ2",
      operator: "includes",
      value: "10",
    },

    validation: [
      {
        type: "requiredIf",
        dependsOn: "socialProtectionWomenQ2",
        value: "10",
        message: "Please specify other program",
      },
    ],
  },

  // ---------- Q3 ----------
  {
    key: "socialProtectionWomenQ3",
    type: "text",
    label: "Year of enrollment",
    labelNp: "तपाईंले यो सुविधा वा भत्ता लिन कहिलेदेखि सुरु गर्नुभएको हो?",
    required: true,
    keyboardType: "number-pad",
    placeholder: "2080 / 2023",
    visibleIf: {
      dependsOn: "socialProtectionWomenQ1",
      value: "Y",
    },
  },
];
