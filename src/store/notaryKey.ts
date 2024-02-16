import keys from '../utils/keys.json';

export enum ActionType {
  SetKey = 'notaryKey/setKey'
}

export const setKey = (key: string) => ({
  type: ActionType.SetKey,
  payload: key
})


export type Action<payload = any> = {
  type: ActionType;
  payload: payload;
  error?: boolean;
  meta?: any;
};


type State = {
  key: string;
}

const initState: State = {
  key: keys.defaultKey
}


function handleKey(state: State, action: Action): State {
  return {
    ...state,
    key: action.payload
  }
}


export default function notaryKey(state = initState, action: Action): State {
  switch (action.type) {
    case ActionType.SetKey:
      return handleKey(state, action);
    default:
      return state;
  }
}
