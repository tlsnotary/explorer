import { ThunkDispatch } from 'redux-thunk';
import { Action, uploadFileSuccess } from './proofupload';
import { AppRootState } from './index';
import { ActionType
 } from './proofupload';


export const uploadFileToIpfs = (file: File) => {
  return async (dispatch: ThunkDispatch<AppRootState, ActionType, Action>) => {
    console.log('here');
    const formData = new FormData();
    formData.append('file', file);
    console.log(formData.get('file'));
    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error('Failed to upload file to IPFS');
      }
      const data = await response.json();
      console.log(data);
      dispatch(uploadFileSuccess(data));
      return data;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      // Handle the error, e.g., dispatch an action to update the state with the error
    }
  }
}

export const getFileFromIpfs = (cid: string) => {
  return async (dispatch: ThunkDispatch<AppRootState, ActionType, Action>) => {
    try {
      const response = await fetch(`/ipfs/${cid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch file from IPFS');
      }
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error('Error fetching file from IPFS:', error);
      // Handle the error, e.g., dispatch an action to update the state with the error
    }
  }
}
