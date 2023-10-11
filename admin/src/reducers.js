import produce from 'immer';
import CONSTANTS from './constants';


const DEFAULT_LOCALE = 'default'
const initialState = {}

export function getFieldState (state, field) {
  const { uid, name, locale } = field
  return state[CONSTANTS.REDUCER]?.[locale || DEFAULT_LOCALE]?.[uid]?.[name] || {}
}

function updateFieldState (state, field, data) {
  const { uid, name } = field
  const locale = field.locale || DEFAULT_LOCALE
  return {
    ...state,
    [locale]: {
      ...state[locale],
      [uid]: {
        ...state[locale]?.[uid],
        [name]: {
          ...state[locale]?.[uid]?.[name],
          ...data
        }
      }
    }
  }
}

export default {
  [CONSTANTS.REDUCER]: produce((previousState, action) => {
    let state = previousState ?? initialState

    if (action.type === CONSTANTS.REDUCER_ADD_VALUE) {
      const { value, field } = action.data
      const currentFieldState = getFieldState(state, field)
      const values = currentFieldState?.values || []
      state = updateFieldState(state, field, {
        values: [...values, value]
      })
    }

    if (action.type === CONSTANTS.REDUCER_LOADING_VALUES) {
      const { field } = action.data
      state = updateFieldState(state, field, {
        values: [],              
        isLoading: true,
        isLoaded: false,
      })
    }

    if (action.type === CONSTANTS.REDUCER_LOADED_VALUES) {
      const { field, values } = action.data

      const currentFieldState = getFieldState(state, field)
      const currentValues = currentFieldState?.values || []

      state = updateFieldState(state, field, {
        values: [...currentValues, ...values],              
        isLoading: false,
        isLoaded: true,
      })
    }

    if (action.type === 'ContentManager/CrudReducer/SUBMIT_SUCCEEDED') {
      return {}
    }

    return state;
  }),
}