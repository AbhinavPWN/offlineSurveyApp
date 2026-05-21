import { QuestionConfig } from "../../components/QuestionRenderer";

export const disableInfantQuestions: QuestionConfig[] = [
  // ---------- Q1 ----------
  {
    key: "disableInfantQ1",
    type: "radio",
    label:
      "Are the person with disability in your HH currently enrolled in any social protection program?",
    labelNp:
      "हजुरको घरमा रहनुभएका अपाङ्गता भएका सदस्यले अहिले सरकारको कुनै पनि सामाजिक सुरक्षा कार्यक्रम वा भत्ता लिइरहनुभएको छ?",

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

    validation: [
      {
        type: "required",
        message: "Please select an option",
      },
    ],
  },

  // ---------- Q2 ----------
  {
    key: "disableInfantQ2",
    type: "checkbox",

    label: "Type of program (Multiple select)",
    labelNp:
      "उहाँले कुन-कुन प्रकारका सुविधाहरू वा भत्ता पाइरहनुभएको छ? (एकभन्दा बढी छान्न मिल्ने)",

    required: true,

    visibleIf: {
      dependsOn: "disableInfantQ1",
      value: "Y",
    },

    options: [
      {
        label: "Disability Allowance",
        labelNp: "अपाङ्गता भत्ता",
        value: "1",
      },
      {
        label: "Disability Certificate",
        labelNp: "अपाङ्गता परिचयपत्र",
        value: "2",
      },
      {
        label: "Health Insurance",
        labelNp: "सरकारी स्वास्थ्य बीमा",
        value: "3",
      },
      {
        label: "Prime Minister Employment Program",
        labelNp: "प्रधानमन्त्री रोजगार कार्यक्रम",
        value: "4",
      },
      {
        label: "People's Housing Program",
        labelNp: "सुलभ आवास कार्यक्रम",
        value: "5",
      },
      {
        label: "Disability Scholarship",
        labelNp: "विद्यालय छात्रवृत्ति",
        value: "6",
      },
      {
        label: "Skill Development Training",
        labelNp: "सीपमूलक तालिम",
        value: "7",
      },
      {
        label: "Food for Work / Food Rations",
        labelNp: "खाद्यान्न सहयोग वा रासन",
        value: "8",
      },
      {
        label: "Other Government Program",
        labelNp: "अन्य कुनै सरकारी योजना",
        value: "10",
      },
    ],

    validation: [
      {
        type: "minSelections",
        value: 1,
        message: "Please select at least one option",
      },
    ],
  },

  // ---------- OTHER TEXT ----------
  {
    key: "disableInfantQ2Others",
    type: "text",

    label: "Specify other program",
    labelNp: "अन्य कार्यक्रम उल्लेख गर्नुहोस्",

    visibleIf: {
      dependsOn: "disableInfantQ2",
      operator: "includes",
      value: "10",
    },

    validation: [
      {
        type: "requiredIf",
        dependsOn: "disableInfantQ2",
        value: "10",
        message: "Please specify the other program",
      },
    ],
  },

  // ---------- Q3 ----------
  {
    key: "disableInfantQ3",
    type: "text",

    label: "Year of enrollment",
    labelNp: "उहाँले यो सुविधा वा भत्ता लिन कुन वर्षदेखि सुरु गर्नुभएको हो?",

    placeholder: "2080",

    keyboardType: "number-pad",

    visibleIf: {
      dependsOn: "disableInfantQ1",
      value: "Y",
    },

    validation: [
      {
        type: "requiredIf",
        dependsOn: "disableInfantQ1",
        value: "Y",
        message: "Please enter enrollment year",
      },
      {
        type: "pattern",
        value: /^\d{4}$/,
        message: "Enter a valid year",
      },
    ],
  },
];
