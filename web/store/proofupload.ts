import { AppRootState } from '.';
import type { Proof } from '../components/types/types'
import { useSelector } from 'react-redux';



export enum ActionType {
  AddFile = 'proofupload/addFile',
  SelectProof = 'proofupload/selectProof',
  UploadFileSuccess = 'proofupload/uploadFileSuccess',
}

export const uploadFile = (fileName: string, proof: Proof) => ({
  type: ActionType.AddFile,
  payload: { fileName, proof }
})

export const selectProof = (proof: string) => ({
  type: ActionType.SelectProof,
  payload: proof
})

export const uploadFileSuccess = (cid: string) => ({
  type: ActionType.UploadFileSuccess,
  payload: cid
})

export type Action<payload = any> = {
  type: ActionType;
  payload: payload;
  error?: boolean;
  meta?: any;
};

type State = {
  proofs: { fileName: string, proof: Proof }[];
  selectedProof?: { fileName: string, proof: Proof, ipfsCID?: string } | null;
}

const initState: State = {
  proofs: []
}

function handleFile(state: State, action: Action): State {
  return {
    ...state,
    proofs: [...state.proofs, action.payload],
    selectedProof: action.payload
  }
}

function handleProofSelect(state: State, action: Action): State {
  return {
    ...state,
    selectedProof: action.payload
  }
}

function handleProofUpload(state: State, action: Action): State {
  return {
    ...state,
    // @ts-ignore
    selectedProof: {
      ...state.selectedProof,
      ipfsCID: action.payload
    }
  }
}

export const useSelectedProof = () => {
  return useSelector((state: AppRootState) => state.proofUpload.selectedProof);
}

export default function proofUpload(state = initState, action: Action): State {
  switch (action.type) {
    case ActionType.AddFile:
      return handleFile(state, action);
    case ActionType.SelectProof:
      return handleProofSelect(state, action);
    case ActionType.UploadFileSuccess:
      return handleProofUpload(state, action);
    default:
      return state;
  }
}
