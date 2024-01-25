

export enum ActionType {
  AddFile = 'proofupload/addFile'
}

export const uploadFile = (file: File) => ({
  type: ActionType.AddFile,
  payload: file
})

export type Action<payload = any> = {
  type: ActionType;
  payload: payload;
  error?: boolean;
  meta?: any;
};

type State = {
  jsonFiles: File[];
}

const initState: State = {
  jsonFiles: []
}

function handleFile(state: State, action: Action): State {
  return {
    ...state,
    jsonFiles: [...state.jsonFiles, action.payload]
  }
}


export default function proofUpload(state = initState, action: Action): State {
  switch (action.type) {
    case ActionType.AddFile:
      return handleFile(state, action);
    default:
      return state;
  }
}
