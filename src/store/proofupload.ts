

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
  proofs: File[];
}

const initState: State = {
  proofs: []
}

function handleFile(state: State, action: Action): State {
  return {
    ...state,
    proofs: [...state.proofs, action.payload]
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
