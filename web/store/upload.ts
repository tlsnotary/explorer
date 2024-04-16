import { ThunkDispatch } from 'redux-thunk';
import { Action, uploadFileSuccess } from './proofupload';
import { AppRootState } from './index';
import { ActionType } from './proofupload';
import { EXPLORER_URL } from '../utils/constants';

export const uploadFileToIpfs = (file: File) => {
  return async (
    dispatch: ThunkDispatch<AppRootState, ActionType, Action>,
  ): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(EXPLORER_URL + '/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to upload file to IPFS');
    }
    const data = await response.json();
    dispatch(uploadFileSuccess(data));
    return data;
  };
};
