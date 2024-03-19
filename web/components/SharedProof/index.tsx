import React, { ReactElement, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProofDetails from '../ProofDetails';
import { useNotaryKey } from '../../store/notaryKey';
import NotaryKey from '../NotaryKey';
import { fetchProofFromIPFS, useIPFSProof } from '../../store/proofs';
import { useDispatch } from 'react-redux';

export default function SharedProof(): ReactElement {
  const { cid } = useParams();
  const [errors, setErrors] = useState<string | null>(null);
  const notaryKey = useNotaryKey();
  const proofData = useIPFSProof(cid);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!cid) {
      setErrors('No IPFS CID found');
      return;
    }
    console.log(notaryKey);
    dispatch(fetchProofFromIPFS(cid, notaryKey))
      .catch(e => setErrors(e.message));
  }, [cid, notaryKey]);

  return (
    <div>
      {<NotaryKey />}
      <div className="flex flex-col items-center">
      {!proofData && errors && <div className="text-red-500 font-bold">{errors}</div>}
      </div>
      {proofData && <ProofDetails proof={proofData.proof} cid={cid} />}
    </div>
  );
}
