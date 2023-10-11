import { useCallback, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFetchClient } from '@strapi/helper-plugin';

import CONSTANTS from '../constants';
import useLocale from './use-locale';

const useEnumerationData = (field) => {
  const locale = useLocale()
  const [fieldValues, setFieldValues] = useState([])

  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const dispatch = useDispatch();
  const reduxState = useSelector((state) => state[CONSTANTS.REDUCER]);

  const fetchClient = useFetchClient()

  const loadData = useCallback(
    async () => {
      setIsLoading(true)

      try {
        const response = await fetchClient.get(CONSTANTS.API_FIELD_OPTIONS, {
          params: {
            ...field,
            locale
          }
        })

        dispatch({
          type: CONSTANTS.REDUCER_LOAD_VALUES,
          data: {
            ...field,
            values: response.data
          }
        })
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoaded(true)
        setIsLoading(false)
      }
    },
    [fetchClient, field, locale],
  )

  useEffect(() => {
    if (isLoading || !field) {
      return;
    }

    const { uid, name } = field
    const currentValues = reduxState?.fields?.[uid]?.[name]

    if (!currentValues && !isLoaded) {
      loadData();
    } else if (Array.isArray(currentValues)) {
      setFieldValues(currentValues)
    }
  }, [reduxState, field, isLoading, isLoaded]);

  const addNewValue = useCallback((value) => {
    dispatch({
      type: CONSTANTS.REDUCER_ADD_VALUE,
      data: {
        ...field,
        value
      }
    })
  }, [])

  return {
    values: fieldValues,
    addValue: addNewValue,
    isLoading
  }
};

export default useEnumerationData;
