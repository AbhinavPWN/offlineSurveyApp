import { QuestionConfig } from "../../components/QuestionRenderer";

export const feAdolescentUnQuestions: QuestionConfig[] = [
  {
    key: "feAdolescentUnQ1",
    label: "Do you take Iron folic acid tablet every week?",
    labelNp: "के तिमी हरेक हप्ता आइरन फोलिक एसिड चक्की खान्छौ?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "खान्छु", value: "Y" },
      { label: "No", labelNp: "खान्न", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "feAdolescentUnQ2",
    label: "Have you taken deworming tablet in last 6 months?",
    labelNp: "के तिमीले पछिल्लो ६ महिनामा जुकाको औषधि खाएकी छौ?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "खाएको छ", value: "Y" },
      { label: "No", labelNp: "खाएको छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "feAdolescentUnQ3",
    label: "Has your menstruation started?",
    labelNp: "के तिम्रो महिनावारी सुरु भयो?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "भयो", value: "Y" },
      { label: "No", labelNp: "भएको छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  // ---------- Menstrual hygiene ----------
  {
    key: "feAdolescentUnQ4",
    label: "What kind of menstrual product do you use?",
    labelNp: "महिनावारी हुँदा तिमी के प्रयोग गर्छौ?",
    type: "select",
    required: true,
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
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "feAdolescentUnQ5",
    label: "How do you dispose sanitary napkin?",
    labelNp: "प्रयोग गरेको प्याडलाई कसरी फाल्छौ?",
    type: "select",
    required: true,
    visibleIf: { dependsOn: "feAdolescentUnQ3", value: "Y" },
    options: [
      { label: "Burn it", labelNp: "जलाउने", value: "B" },
      { label: "Bury it", labelNp: "पुर्ने", value: "U" },
      { label: "Throw into garbage", labelNp: "फोहोरमा फाल्ने", value: "T" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "feAdolescentUnQ6",
    label: "How do you wash it?",
    labelNp: "यसलाई कसरी धुन्छौ?",
    type: "select",
    required: true,
    visibleIf: { dependsOn: "feAdolescentUnQ3", value: "Y" },
    options: [
      { label: "Water only", labelNp: "पानीले मात्र", value: "W" },
      { label: "Soap and water", labelNp: "साबुन र पानीले", value: "S" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "feAdolescentUnQ7",
    label: "How do you dry it?",
    labelNp: "यसलाई कसरी सुकाउँछौ?",
    type: "select",
    required: true,
    visibleIf: { dependsOn: "feAdolescentUnQ3", value: "Y" },
    options: [
      { label: "In the sun", labelNp: "घाममा", value: "S" },
      { label: "Protected area", labelNp: "घाम नलाग्ने ठाउँमा", value: "A" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  // ---------- Symptoms ----------
  {
    key: "feAdolescentUnQ8",
    label: "Are you suffering from any of the following?",
    labelNp: "के तिमीलाई तलका मध्ये कुनै समस्या छ?",
    type: "checkbox",
    options: [
      { label: "Burning urine", labelNp: "पिसाब पोल्ने", value: "1" },
      { label: "Genital discharge", labelNp: "योनीबाट पानी बग्ने", value: "2" },
      { label: "Genital sore/ulcer", labelNp: "यौनाङ्गमा घाउ", value: "3" },
      {
        label: "Abnormal growth",
        labelNp: "अस्वाभाविक मासु पलाउने",
        value: "4",
      },
      {
        label: "Lower abdominal pain",
        labelNp: "पेटको तल्लो भाग दुख्ने",
        value: "5",
      },
    ],
  },

  {
    key: "feAdolescentUnQ9",
    label: "Have you visited health facility?",
    labelNp: "के तिमी स्वास्थ्य संस्थामा गयौ?",
    type: "select",
    required: true,
    visibleIf: {
      dependsOn: "feAdolescentUnQ8",
      value: "1", // any value triggers render (handled upstream)
    },
    options: [
      { label: "Yes", labelNp: "गएँ", value: "Y" },
      { label: "No", labelNp: "गइनँ", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "feAdolescentUnQ10",
    label: "Do you feel any of the following?",
    labelNp: "के तिमीलाई तलका मध्ये कुनै महसुस हुन्छ?",
    type: "checkbox",
    visibleIf: {
      dependsOn: "feAdolescentUnQ9",
      value: "N",
    },
    options: [
      {
        label: "Persistent unhappiness",
        labelNp: "सधैं दुखी रहने",
        value: "1",
      },
      {
        label: "Anxious/fearful",
        labelNp: "सधैं डराउने वा तनाव हुने",
        value: "2",
      },
      {
        label: "Irritable/angry",
        labelNp: "रिसाउने वा झर्को लाग्ने",
        value: "3",
      },
      {
        label: "Trouble working/hygiene",
        labelNp: "काम वा सरसफाइमा समस्या",
        value: "4",
      },
      {
        label: "Sleep/eating issues",
        labelNp: "निन्द्रा वा खाने बानी समस्या",
        value: "5",
      },
    ],
  },
];
