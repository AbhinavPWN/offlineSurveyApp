// src\features\survey\state\surveyReducer.ts
export type SurveyAnswers = Record<string, string | string[] | null>;

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
        answer: string | string[] | null;
      };
    };

export const initialSurveyState: SurveyState = {
  answers: {},
};

function isEqual(a: any, b: any): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => val === b[i]);
  }
  return a === b;
}

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
      if (isEqual(state.answers[questionKey], answer)) return state;

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
  answer: string | string[] | null,
): SurveyAction => ({
  type: "SET_ANSWER",
  payload: { questionKey, answer },
});
