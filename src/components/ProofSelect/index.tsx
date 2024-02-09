import React, { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { readFileAsync } from '../../utils';
import { selectProof } from '../../store/proofupload';

export default function ProofSelect(): ReactElement {
  const dispatch = useDispatch();

  const proofs = useSelector((state: any) => state.proofUpload.proofs);


  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = e.target.selectedIndex;
    const proof = proofs[selectedIndex - 1];
    dispatch(selectProof(proof));
  }

  return (
    <div className='flex flex-row m-auto items-center h-10 bg-gray-800 rounded gap-4 text-black'>
      {proofs && (
      <select onChange={handleChange} className='bg-gray-800 text-white font-bold'>
        <option disabled selected className='font-bold'>Select a proof</option>
        {proofs && proofs.map((proof: any, index: number) => (
          <option key={index} className='bg-gray-800 text-white font-bold'>
            {proof.fileName}
          </option>
        ))}
      </select>
    )}
    </div>
  );
}
