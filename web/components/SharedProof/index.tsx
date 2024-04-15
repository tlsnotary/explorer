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

    async function fetchFile() {
      if (!cid) {
        setErrors('No CID provided');
        return;
      }
      const response = await fetch(`/gateway/ipfs/${cid}`);
      if (!response.ok) {
        setErrors('Failed to fetch file from IPFS');
        throw new Error('Failed to fetch file from IPFS');
      }
      const data = await response.json();
      try {
        let pubKey: any;
        if (data.notaryUrl) {
          const notaryFetch = await fetch(data.notaryUrl + '/info');
          const notaryData = await notaryFetch.json();
          pubKey = notaryData.publicKey;
        }

        const proof = await verify(data, pubKey || notaryKey);

        setVerifiedProof(proof);

      } catch (e) {
        setErrors('Provide a valid public key')
      }
      return data;
    }
    dispatch(fetchProofFromIPFS(cid, notaryKey))
      .catch(e => {
        console.error(e);
        setErrors(e.message);
      });
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
