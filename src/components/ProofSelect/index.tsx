import React, { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { readFileAsync } from '../../utils';
import { selectProof } from '../../store/proofupload';

export default function ProofSelect(): ReactElement {

  const proofs = useSelector((state: any) => state.proofUpload.proofs);
  const dispatch = useDispatch();


  const handleClick = async (proof: any) => {
    dispatch(selectProof(proof));
  }

  return (
    <div>
      Proofs
      {proofs && proofs.map((proof: any, index: number) => (
        <div key={index} onClick={() => handleClick(proof)}>
          {proof.fileName}
        </div>
      ))}
    </div>
  )
}
