import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFetchClient } from '@strapi/helper-plugin';

import CONSTANTS from '../constants';
import { getFieldState } from '../reducers';

const useEnumerationData = (field) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => getFieldState(state, field));

  const [isLoading, setLoading] = useState(false)

  const fetchClient = useFetchClient()

  const loadData = useCallback(
    async () => {
      dispatch({
        type: CONSTANTS.REDUCER_LOADING_VALUES,
        data: {
          field
        }
      })
      setLoading(true)

      try {
        const response = await fetchClient.get(CONSTANTS.API_FIELD_OPTIONS, {
          params: field
        })

        dispatch({
          type: CONSTANTS.REDUCER_LOADED_VALUES,
          data: {
            field,
            values: response.data
          }
        })
        setLoading(false)
      } catch (error) {
        console.error(error)
        dispatch({
          type: CONSTANTS.REDUCER_RESET,
          data: {
            field
          }
        })
      }
    },
    [fetchClient, field],
  )

  useEffect(() => {
    if (!isLoading && !state.isLoading && !state.isLoaded) {
      loadData();
    }
  }, [state, isLoading, field, loadData]);

  const addNewValue = useCallback((value) => {
    dispatch({
      type: CONSTANTS.REDUCER_ADD_VALUE,
      data: {
        field,
        value
      }
    })
  }, [field])

  return {
    values: state.values || [],
    addValue: addNewValue
  }
};

export default useEnumerationData;
