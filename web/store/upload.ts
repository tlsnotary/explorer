import { ThunkDispatch } from 'redux-thunk';
import { Action, uploadFileSuccess } from './proofupload';
import { AppRootState } from './index';
import { ActionType } from './proofupload';


export const uploadFileToIpfs = (file: File) => {
  return async (dispatch: ThunkDispatch<AppRootState, ActionType, Action>) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error('Failed to upload file to IPFS');
      }
      const data = await response.json();
      dispatch(uploadFileSuccess(data))
      return data;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
    }
  }
}
