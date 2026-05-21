import { QuestionConfig } from "../../components/QuestionRenderer";

export const childrenQuestions: QuestionConfig[] = [
  {
    key: "childrenQ1",
    label: "Child ate food other than breast milk (last 24 hrs)?",
    labelNp:
      "पछिल्लो २४ घण्टामा बच्चाले आमाको दूध बाहेक अरु खानेकुरा खाएको छ? (२४ महिनासम्म)",
    type: "select",
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message:
          "Please confirm if the child ate any food other than breast milk",
      },
    ],
  },

  {
    key: "childrenQ2",
    label: "Vitamin A taken in last 6 months?",
    labelNp: "पछिल्लो ६ महिनामा भिटामिन 'ए' खाएको छ?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "खाएको छ", value: "Y" },
      { label: "No", labelNp: "खाएको छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message:
          "Please select if the child received Vitamin A in the last 6 months",
      },
    ],
  },

  {
    key: "childrenQ3",
    label: "Deworming tablet taken in last 6 months?",
    labelNp: "पछिल्लो ६ महिनामा जुकाको औषधि खाएको छ?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "खाएको छ", value: "Y" },
      { label: "No", labelNp: "खाएको छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message:
          "Please select if the child took deworming medicine in the last 6 months",
      },
    ],
  },

  {
    key: "childrenQ4",
    label: "Had diarrhea in last 15 days?",
    labelNp: "पछिल्लो १५ दिनमा बच्चालाई पखाला लागेको छ?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message:
          "Please indicate whether the child had diarrhea in the last 15 days",
      },
    ],
  },

  {
    key: "childrenQ5",
    label: "Was ORS given during diarrhea?",
    labelNp: "पखाला हुँदा जीवनजल (ORS) दिइयो?",
    type: "select",
    visibleIf: {
      dependsOn: "childrenQ4",
      value: "Y",
    },
    options: [
      { label: "Yes", labelNp: "दिएँ", value: "Y" },
      { label: "No", labelNp: "दिइनँ", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please confirm if ORS was given to the child during diarrhea",
      },
    ],
  },
];
