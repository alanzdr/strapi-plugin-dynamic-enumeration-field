import produce from 'immer';
import pluginId from './pluginId';

export const REDUCERS = {
  ID: pluginId,
  ADD_VALUE: pluginId + '/add-field',
  ON_LOAD_VALUES: pluginId + '/update-fieldd'
}

const initialState = {
  fields: {}
};

export default {
  [REDUCERS.ID]: produce((previousState, action) => {
    let state = previousState ?? initialState

    if (action.type === REDUCERS.ADD_VALUE) {
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

    if (action.type === REDUCERS.ON_LOAD_VALUES) {
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