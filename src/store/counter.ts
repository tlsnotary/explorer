import { useSelector } from 'react-redux';
import deepEqual from 'fast-deep-equal';
import type { AppRootState } from './index';
import { Dispatch } from 'redux';

export enum ActionType {
  Increment = 'counter/increment',
  SetLoading = 'counter/setLoading',
}

export type Action<payload = any> = {
  type: ActionType;
  payload: payload;
  error?: boolean;
  meta?: any;
};

type State = {
  value: number;
  loading: boolean;
};

const initState: State = {
  value: 0,
  loading: false,
};

export const incrementCounter = (): Action => ({
  type: ActionType.Increment,
  payload: null,
});

export const setLoading = (loading = false): Action<boolean> => ({
  type: ActionType.SetLoading,
  payload: loading,
});

export const asyncIncrementCounter = (timeout = 1000): any => async (dispatch: Dispatch, getState: () => AppRootState) => {
  dispatch(setLoading(true));
  await new Promise(r => setTimeout(r, timeout));
  dispatch(incrementCounter());
  dispatch(setLoading(false));
};

export default function counter(state = initState, action: Action): State {
  switch (action.type) {
    case ActionType.Increment:
      return handleIncrement(state, action);
    case ActionType.SetLoading:
      return handleSetLoading(state, action);
    default:
      return state;
  }
}

function handleIncrement(state: State, action: Action): State {
  return {
    ...state,
    value: state.value + 1,
  };
}

function handleSetLoading(state: State, action: Action<boolean>): State {
  return {
    ...state,
    loading: action.payload,
  };
}

export function useCounter() {
  return useSelector((state: AppRootState) => {
    return state.counter.value;
  }, deepEqual);
}

export function useLoading() {
  return useSelector((state: AppRootState) => {
    return state.counter.loading;
  }, deepEqual);
}