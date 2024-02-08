import type { Proof } from '../components/types/types'

export enum ActionType {
  AddFile = 'proofupload/addFile',
  SelectProof = 'proofupload/selectProof'
}

export const uploadFile = (fileName: string, proof: Proof) => ({
  type: ActionType.AddFile,
  payload: { fileName, proof }
})

export const selectProof = (proof: string) => ({
  type: ActionType.SelectProof,
  payload: proof
})

export type Action<payload = any> = {
  type: ActionType;
  payload: payload;
  error?: boolean;
  meta?: any;
};

type State = {
  proofs: { fileName: string, proof: Proof }[];
  selectedProof?: {fileName: string, proof: Proof} | null;
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

function handleProofSelect(state: State, action: Action): State {
  return {
    ...state,
    selectedProof: action.payload
  }

}

export default function proofUpload(state = initState, action: Action): State {
  switch (action.type) {
    case ActionType.AddFile:
      return handleFile(state, action);
    case ActionType.SelectProof:
      return handleProofSelect(state, action);
    default:
      return state;
  }
}
