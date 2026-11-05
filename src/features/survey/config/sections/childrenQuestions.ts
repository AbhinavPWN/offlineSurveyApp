import { QuestionConfig } from "../../components/QuestionRenderer";

export const childrenQuestions: QuestionConfig[] = [
  {
    key: "childrenQ1",
    label:
      "In the last 24 hours, is the baby eating any food other than breast milk? (Ask upto 24 months)",
    labelNp:
      "पछिल्लो २४ घण्टामा, बच्चाले आमाको दूध बाहेक अरु केही खानेकुरा खाएको छ? (२४ महिना सम्मकालाई सोध्ने)",
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

  ...[
    {
      label: "fIPV-2 + Measles-Rubella-1 + PCV-3 (at 9 months)",
      labelNp: "एफआईपीभी-२ + दादुरा-रुबेला-१ + पि.सि.भि.-३ – जन्मिएको ९ महिनामा",
    },
    {
      label: "Japanese Encephalitis (at 12 months)",
      labelNp: "जापानीज इन्सेफलाइटिस – जन्मिएको १२ महिनामा",
    },
    {
      label: "Measles-Rubella-2 (at 15 months)",
      labelNp: "दादुरा-रुबेला-२ – जन्मिएको १५ महिनामा",
    },
  ].map<QuestionConfig>((vaccine, index) => ({
    ...vaccine,
    key: `childrenQ6Ans${index + 1}`,
    groupTitle: index === 0 ? "Vaccination history" : undefined,
    groupTitleNp: index === 0 ? "खोपको विवरण (२४ महिना सम्मकालाई सोध्ने)" : undefined,
    type: "radio",
    compactChoices: true,
    options: [
      { label: "Yes", labelNp: "लगाएको छ", value: "Y" },
      { label: "No", labelNp: "लगाएको छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "Select Yes or No for this vaccination" }],
  })),

  {
    key: "childrenQ2",
    label: "Has the child given Vitamin A supplementation in last 6 months?",
    labelNp: "के बच्चाले पछिल्लो ६ महिनामा भिटामिन 'ए' क्याप्सुल खाएको छ?",
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
    label: "Has the child given deworming tablet in last 6 months?",
    labelNp: "के बच्चाले पछिल्लो ६ महिनामा जुकाको औषधि खाएको छ?",
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
    label: "Has the child had diarrhea in last 15 days?",
    labelNp: "के पछिल्लो १५ दिनमा बच्चालाई पखाला लागेको छ?",
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
    label: "Did you give ORS to the child?",
    labelNp: "के तपाईंले बच्चालाई जीवनजल (ORS) दिनुभयो?",
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
