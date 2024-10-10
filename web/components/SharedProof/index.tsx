import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProofFromIPFS, useIPFSProof } from '../../store/proofs';
import { useDispatch } from 'react-redux';
import ProofViewer from '../ProofViewer';
import { FileDropdown } from '../FileDropdown';
import { PubkeyInput } from '../../pages/PubkeyInput';
import { AttestedData } from '../../utils/types/types';
import { File } from '@web-std/file';
import { verify } from '../../utils';

export default function SharedProof(): ReactElement {
  const { cid } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<string | null>(null);
  const proofData = useIPFSProof(cid);
  const dispatch = useDispatch();
  const file = new File([JSON.stringify(proofData?.raw)], `${cid}.json`, {
    type: 'text/plain',
  });
  const [verifiedProof, setVerifiedProof] = useState<AttestedData | null>(
    proofData?.proof || null,
  );

  useEffect(() => {
    if (!cid) return;
    dispatch(fetchProofFromIPFS(cid)).catch((e) => {
      console.error(e);
      setErrors(e.message);
    });
  }, [cid]);

  const onVerify = useCallback(
    async (key = '') => {
      if (!proofData?.raw) return;
      const resp = await verify(proofData?.raw, key);
      setVerifiedProof(resp);
    },
    [proofData?.raw],
  );

  if (!proofData) return <></>;

  return (
    <div className="flex flex-col items-center w-full h-screen m-auto gap-2">
      {!!file && (
        <FileDropdown
          files={[file]}
          onChange={() => null}
          onDelete={() => navigate('/')}
        />
      )}
      {!!proofData.raw && !verifiedProof && !proofData.proof && (
        <PubkeyInput
          className="w-2/3 flex-shrink-0"
          onNext={onVerify}
          proof={proofData.raw}
        />
      )}
      {(verifiedProof || proofData.proof) && (
        <ProofViewer
          className="h-4/5 w-2/3 flex-shrink-0"
          file={file}
          proof={proofData.raw}
          verifiedProof={verifiedProof || proofData.proof!}
        />
      )}
    </div>
  );
}
