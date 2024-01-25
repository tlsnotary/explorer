import React, { ReactElement, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { uploadFile } from '../../store/proofupload';


export default function FileDrop(): ReactElement {
  const dispatch = useDispatch();

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const files = e.dataTransfer.files;

    if (files.length > 0) {
      dispatch(uploadFile(files[0]));
    }
}, [dispatch]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const files = e.target.files;
    if (files && files.length > 0) {
      dispatch(uploadFile(files[0]));
    }
  },
  [dispatch]);


return (
  <div className="flex flex-col items-center justify-center h-screen w-4/5 m-auto ">
    <label htmlFor="file-upload" className="flex flex-col items-center justify-start h-1/2 w-full">
    <div
      className="flex flex-col items-center justify-center w-full h-full border-dashed border-gray-400 rounded-lg border-2 cursor-pointer bg-gray-800"
      onDrop={handleFileDrop}
      onDragOver={(e) => e.preventDefault()}
    >
     <i className="text-white fa-solid fa-upload text-6xl"></i>
     <br></br>
     <p className='font-bold font-medium text-white'>Drop your "proof.json" file here or click to select</p>
     </div>
     <input
     id="file-upload"
     type="file"
     onChange={handleFileInput}
     accept=".json"
     className="w-full h-full hidden" />
    </label>
  </div>
  )
}
