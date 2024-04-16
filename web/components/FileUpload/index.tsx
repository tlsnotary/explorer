import React, { ReactElement, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { uploadFile, selectProof } from '../../store/proofupload';
import { readFileAsync } from '../../utils';
import NotaryKey from '../NotaryKey';
import ProofDetails from '../ProofDetails';
import type { Proof } from '../types/types';
import { useNotaryKey } from '../../store/notaryKey';
import Icon from '../Icon';

export default function FileDrop(): ReactElement {
  const dispatch = useDispatch();
  const notaryKey = useNotaryKey();


  const [error, setError] = useState<string | null>(null);
  const [verifiedProof, setVerifiedProof] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = useCallback(async (file: any): Promise<void> => {
    if (file.type !== 'application/json') {
      setError('Please upload a valid JSON file.');
      return;
    }

    if (file.size >= 1024 * 1024) {
      setError('File size exceeds the maximum limit (1MB).');
      return;
    }
    setFile(file);
    setError(null);
    let verifiedProof: Proof;
    const proofContent = await readFileAsync(file);
    const { verify } = await import('tlsn-js');

    try {
      let pubKey: any;
      if (JSON.parse(proofContent).notaryUrl) {
        const notaryFetch = await fetch(JSON.parse(proofContent).notaryUrl + '/info');
        const notaryData = await notaryFetch.json();
        pubKey = notaryData.publicKey;
      }
      verifiedProof = await verify(JSON.parse(proofContent), pubKey || notaryKey);
      setVerifiedProof(verifiedProof);
    } catch(e) {
      setError(e as string);
      return;
    }
    dispatch(uploadFile(file.name, verifiedProof));
}, [dispatch, notaryKey])

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const files = e.dataTransfer.files;

    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
}, [handleFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);


return (
  <div className="h-screen w-4/5 m-auto ">
    <label htmlFor="file-upload" className="flex flex-col items-center justify-start h-1/2 w-full">
    <div
      className="flex flex-col items-center justify-center w-full h-full border-dashed border-gray-400 rounded-lg border-2 cursor-pointer bg-gray-800"
      onDrop={handleFileDrop}
      onDragOver={(e) => e.preventDefault()}
    >
    <Icon className="text-white" fa="fa-solid fa-upload" size={6} />
     <br></br>
     <p className="font-bold font-medium text-white">Drop your "proof.json" file here or click to select</p>
     {error && <p className="text-red-500 font-bold">{error}</p>}
     </div>
     <input
     id="file-upload"
     type="file"
     onChange={handleFileInput}
     accept=".json"
     className="w-full h-full hidden" />
    </label>
    <br></br>
    <NotaryKey />
    <br></br>
    <br></br>
    {!error && <ProofDetails proof={verifiedProof} file={file} />}
  </div>
  )
}
