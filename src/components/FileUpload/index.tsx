import React, { ReactElement, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { uploadFile } from '../../store/proofupload';
import NotaryKey from '../NotaryKey';

export default function FileDrop(): ReactElement {
  const dispatch = useDispatch();

  const [error, setError] = useState<string | null>(null);


  const handleFileUpload = useCallback((file: File): void => {
    if (file.type !== 'application/json') {
      setError('Please upload a valid JSON file.');
      return;
    }

    if (file.size >= 1024 * 1024) {
      setError('File size exceeds the maximum limit (1MB).');
      return;
    }
    setError(null);
    dispatch(uploadFile(file));

}, [dispatch])

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
  },
  [handleFileUpload]);


return (
  <div className="h-screen w-4/5 m-auto ">
    <label htmlFor="file-upload" className="flex flex-col items-center justify-start h-1/2 w-full">
    <div
      className="flex flex-col items-center justify-center w-full h-full border-dashed border-gray-400 rounded-lg border-2 cursor-pointer bg-gray-800"
      onDrop={handleFileDrop}
      onDragOver={(e) => e.preventDefault()}
    >
     <i className="text-white fa-solid fa-upload text-6xl"></i>
     <br></br>
     <p className="font-bold font-medium text-white">Drop your "proof.json" file here or click to select</p>
     </div>
     <input
     id="file-upload"
     type="file"
     onChange={handleFileInput}
     accept=".json"
     className="w-full h-full hidden" />
    </label>
    {error && <p className="text-red-500 font-bold">{error}</p>}
    <NotaryKey />
  </div>
  )
}
