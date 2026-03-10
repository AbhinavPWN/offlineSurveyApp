export type SurveyAnswers = Record<string, string>;

export interface SurveyState {
  answers: SurveyAnswers;
}

export type SurveyAction =
  | {
      type: "LOAD_DRAFT";
      payload: {
        answers: SurveyAnswers;
      };
    }
  | {
      type: "SET_ANSWER";
      payload: {
        questionKey: string;
        answer: string;
      };
    };

export const initialSurveyState: SurveyState = {
  answers: {},
};

export function surveyReducer(
  state: SurveyState,
  action: SurveyAction,
): SurveyState {
  switch (action.type) {
    case "LOAD_DRAFT": {
      return {
        ...state,
        answers: { ...action.payload.answers },
      };
    }

    case "SET_ANSWER": {
      const { questionKey, answer } = action.payload;

      if (!questionKey) return state;
      if (state.answers[questionKey] === answer) return state;

      return {
        ...state,
        answers: {
          ...state.answers,
          [questionKey]: answer,
        },
      };
    }

    default: {
      return state;
    }
  }
}

export const loadSurveyDraft = (answers: SurveyAnswers): SurveyAction => ({
  type: "LOAD_DRAFT",
  payload: { answers },
});

export const setSurveyAnswer = (
  questionKey: string,
  answer: string,
): SurveyAction => ({
  type: "SET_ANSWER",
  payload: { questionKey, answer },
});
