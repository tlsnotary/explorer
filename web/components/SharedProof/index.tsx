import React, { ReactElement, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { verify } from 'tlsn-js';
import ProofDetails from '../ProofDetails';
import type { Proof } from '../types/types';

export default function SharedProof(): ReactElement {
  const { cid } = useParams();

  const [verifiedProof, setVerifiedProof] = useState<Proof | null>(null);
  const [errors, setErrors] = useState<string | null>(null);

  const notaryKey = useSelector((state: any) => state.notaryKey.key);

  useEffect(() => {
    async function fetchFile() {
      if (!cid) {
        setErrors('No CID provided');
        return;
      }
      const response = await fetch(`/ipfs/${cid}`);
      if (!response.ok) {
        setErrors('Failed to fetch file from IPFS');
        throw new Error('Failed to fetch file from IPFS');
      }
      const data = await response.json();
      const proof = await verify(data, notaryKey);
      setVerifiedProof(proof);
      return data;
    }

    fetchFile();

  }, [cid]);

  return (
    <div>
      {errors && <div>{errors}</div>}
      {verifiedProof && <ProofDetails proof={verifiedProof} cid={cid} />}
    </div>
  );
}
