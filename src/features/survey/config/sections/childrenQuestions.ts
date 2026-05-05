import { QuestionConfig } from "../../components/QuestionRenderer";

export const childrenQuestions: QuestionConfig[] = [
  {
    key: "childrenQ1",
    label:
      "In the last 24 hours, is the baby eating any food other than breast milk?",
    labelNp:
      "पछिल्लो २४ घण्टामा बच्चाले आमाको दूध बाहेक अरु खानेकुरा खाएको छ? (२४ महिनासम्म)",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "childrenQ2",
    label: "Has the child received Vitamin A supplementation in last 6 months?",
    labelNp: "के बच्चाले पछिल्लो ६ महिनामा भिटामिन 'ए' क्याप्सुल खाएको छ?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "खाएको छ", value: "Y" },
      { label: "No", labelNp: "खाएको छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "childrenQ3",
    label: "Has the child received Deworming tablet in last 6 months?",
    labelNp: "के बच्चाले पछिल्लो ६ महिनामा जुकाको औषधि खाएको छ?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "खाएको छ", value: "Y" },
      { label: "No", labelNp: "खाएको छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "childrenQ4",
    label: "Has the child had diarrhea in last 15 days?",
    labelNp: "के पछिल्लो १५ दिनमा बच्चालाई पखाला लागेको छ?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "childrenQ5",
    label: "Did you give ORS to the child?",
    labelNp: "के तपाईंले बच्चालाई जीवनजल (ORS) दिनुभयो?",
    type: "select",
    required: true,
    visibleIf: {
      dependsOn: "childrenQ4",
      value: "Y",
    },
    options: [
      { label: "Yes", labelNp: "दिएँ", value: "Y" },
      { label: "No", labelNp: "दिइनँ", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },
];
