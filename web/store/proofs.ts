import { ThunkDispatch } from 'redux-thunk';
import { AppRootState } from './index';
import type { Proof } from 'tlsn-js-v5/build/types';
import { useSelector } from 'react-redux';
import deepEqual from 'fast-deep-equal';
import { EXPLORER_URL } from '../utils/constants';

enum ActionType {
  SetIPFSProof = 'proofs/setIPFSProof',
}

export type Action<payload = any> = {
  type: ActionType;
  payload: payload;
  error?: boolean;
  meta?: any;
};

type ProofData = {
  raw: Proof;
  proof?: {
    time: number;
    sent: string;
    recv: string;
    notaryUrl: string;
  };
};

type State = {
  ipfs: {
    [cid: string]: ProofData;
  };
};

const initState: State = {
  ipfs: {},
};

export const fetchProofFromIPFS =
  (cid: string, notaryKey = '') =>
  async (
    dispatch: ThunkDispatch<AppRootState, ActionType, Action>,
    getState: () => AppRootState,
  ) => {
    const old = getState().proofs.ipfs[cid];

    let data;

    if (!old?.raw) {
      const response = await fetch(EXPLORER_URL + `/gateway/ipfs/${cid}`);

      if (!response.ok) {
        throw new Error('Failed to fetch file from IPFS');
      }

      data = await response.json();
    } else {
      data = old.raw;
    }

    const { verify } = await import('tlsn-js-v5/src');

    const proof = await verify(data, notaryKey);

    dispatch(setIPFSProof({ cid, proof, raw: data }));
  };

export const setIPFSProof = (
  payload: ProofData & {
    cid: string;
  },
) => ({
  type: ActionType.SetIPFSProof,
  payload: payload,
});

export default function proofs(
  state = initState,
  action: Action<{
    cid: string;
    raw: Proof;
    proof: {
      time: number;
      sent: string;
      recv: string;
      notaryUrl: string;
    };
  }>,
): State {
  switch (action.type) {
    case ActionType.SetIPFSProof:
      return {
        ...state,
        ipfs: {
          ...state.ipfs,
          [action.payload.cid]: {
            proof: action.payload.proof,
            raw: action.payload.raw,
          },
        },
      };
    default:
      return state;
  }
}

export const useIPFSProof = (cid?: string): ProofData | null => {
  return useSelector((state: AppRootState) => {
    if (!cid) return null;
    return state.proofs.ipfs[cid] || null;
  }, deepEqual);
};
