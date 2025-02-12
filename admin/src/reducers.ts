import { produce } from "immer";
import CONSTANTS from "./constants";
import {
  IStateLocaleData,
  IReducerState,
  IStateData,
  IReducerAction,
} from "./types";

const DEFAULT_LOCALE = "default";
const initialState: IStateLocaleData = {};

const SUBMIT_SUCCEEDED = "adminApi/executeQuery/fulfilled";

export function getFieldState(
  state: IReducerState | IStateLocaleData,
  field: any
): IStateData | null {
  const { uid, name } = field || {};
  const locale = field?.locale || DEFAULT_LOCALE;
  const locales = (state[CONSTANTS.REDUCER] ?? state) as IStateLocaleData;
  const currentLocale = locales[locale];

  if (!currentLocale) {
    return null;
  }

  return currentLocale?.[uid]?.[name] ?? null;
}

function updateFieldState(
  state: IStateLocaleData,
  field: any,
  data: Partial<IStateData>
) {
  const { uid, name } = field;
  const locale = field.locale || DEFAULT_LOCALE;
  return {
    ...state,
    [locale]: {
      ...state[locale],
      [uid]: {
        ...state[locale]?.[uid],
        [name]: {
          ...state[locale]?.[uid]?.[name],
          ...data,
        },
      },
    },
  };
}

export default {
  [CONSTANTS.REDUCER]: produce(
    (previousState: IStateLocaleData, action: IReducerAction) => {
      let state = previousState ?? initialState;
      const { values, field } = action.data ?? {};
      const currentFieldState = getFieldState(state, field);
      const currentValues = currentFieldState?.values || [];

      switch (action.type) {
        case CONSTANTS.REDUCER_ADD_VALUE:
          const updatedValues = [...currentValues, ...(values || [])];
          state = updateFieldState(state, field, {
            values: [...new Set(updatedValues)],
          });
          break;
        case CONSTANTS.REDUCER_LOADING_VALUES:
          state = updateFieldState(state, field, {
            values: [],
            isLoading: true,
            isLoaded: false,
          });
          break;
        case CONSTANTS.REDUCER_LOADED_VALUES:
          state = updateFieldState(state, field, {
            values: [...new Set(values || [])],
            isLoading: false,
            isLoaded: true,
          });
          break;
        case CONSTANTS.REDUCER_RESET:
          state = updateFieldState(state, field, {
            values: [],
            isLoading: false,
            isLoaded: false,
          });
          break;
        case SUBMIT_SUCCEEDED:
          state = initialState;
          break;
        default:
          break;
      }

      return state;
    }
  ),
};
