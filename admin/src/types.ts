export interface IReducerAction {
  type: string;
  data?: {
    field: any;
    values: string[];
  };
}

export interface IStateData {
  values: string[];
  isLoading: boolean;
  isLoaded: boolean;
}

export type IStateFieldData = Record<string, IStateData>;
export type IStateApiData = Record<string, IStateFieldData>;
export type IStateLocaleData = Record<string, IStateApiData>;
export type IReducerState = Record<string, IStateLocaleData>;
