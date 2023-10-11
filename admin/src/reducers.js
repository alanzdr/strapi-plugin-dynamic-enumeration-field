import produce from 'immer';
import CONSTANTS from './constants';


const initialState = {
  fields: {}
};

export default {
  [CONSTANTS.REDUCER]: produce((previousState, action) => {
    let state = previousState ?? initialState

    if (action.type === CONSTANTS.REDUCER_ADD_VALUE) {
      const { uid, name, value } = action.data
      
      if (!uid || !name) {
        return state
      }

      const values = state.fields[uid]?.[name] ?? []

      state = {
        ...state,
        fields: {
          ...state.fields,
          [uid]: {
            ...state.fields[uid],
            [name]: [...values, value]
          }
        }
      }
    }

    if (action.type === CONSTANTS.REDUCER_LOAD_VALUES) {
      const { uid, name, values } = action.data
      
      if (!uid || !name) {
        return state
      }
      
      state = {
        ...state,
        fields: {
          ...state.fields,
          [uid]: {
            ...state.fields[uid],
            [name]: values
          }
        }
      }
    }

    return state;
  })
}