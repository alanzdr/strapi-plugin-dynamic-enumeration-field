import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFetchClient } from "@strapi/strapi/admin";

import CONSTANTS from "../constants";
import { getFieldState } from "../reducers";
import { IReducerState } from "../types";

const useEnumerationData = (field: any) => {
  const dispatch = useDispatch();
  const state = useSelector((state: IReducerState) =>
    getFieldState(state, field)
  );

  const [isLoading, setLoading] = useState(false);

  const fetchClient = useFetchClient();

  const loadData = useCallback(async () => {
    dispatch({
      type: CONSTANTS.REDUCER_LOADING_VALUES,
      data: {
        field,
      },
    });
    setLoading(true);

    try {
      const response = await fetchClient.get(CONSTANTS.API_FIELD_OPTIONS, {
        params: field,
      });

      dispatch({
        type: CONSTANTS.REDUCER_LOADED_VALUES,
        data: {
          field,
          values: response.data,
        },
      });
      setLoading(false);
    } catch (error) {
      console.error(error);
      dispatch({
        type: CONSTANTS.REDUCER_RESET,
        data: {
          field,
        },
      });
    }
  }, [fetchClient, field]);

  const resetValues = useCallback(() => {
    dispatch({
      type: CONSTANTS.REDUCER_RESET,
      data: {
        field,
      },
    });
  }, []);

  useEffect(() => {
    if (!isLoading && !state?.isLoading && !state?.isLoaded) {
      loadData();
    }
  }, [state, isLoading, field, loadData]);

  const addNewValue = useCallback(
    (value: string) => {
      dispatch({
        type: CONSTANTS.REDUCER_ADD_VALUE,
        data: {
          field,
          values: [value],
        },
      });
    },
    [field]
  );

  return {
    values: state?.values ?? [],
    addValue: addNewValue,
    resetValues,
  };
};

export default useEnumerationData;
