import React, { ReactElement, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import FileUploadInput from '../../components/FileUploadInput';
import ProofViewer from '../../components/ProofViewer';
import {
  Attestation,
  AttestedData as VerifiedProof,
} from '../../utils/types/types';
import { FileDropdown } from '../../components/FileDropdown';
import { PubkeyInput } from '../PubkeyInput';

export default function FileDrop(): ReactElement {
  const dispatch = useDispatch();
  const [error, setError] = useState<string>('');
  const [verifiedProof, setVerifiedProof] = useState<VerifiedProof | null>(
    null,
  );
  const [rawJson, setRawJson] = useState<any | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'pubkey' | 'result'>('upload');
  const [pubkey, setPubkey] = useState('');
  const [uploading, setUploading] = useState(false);

  const onVerify = useCallback(async (json: Attestation, key = '') => {
    try {
      const { verify } = await import('../../utils');
      const resp = await verify(json, key);
      setVerifiedProof(resp);
      setStep('result');
    } catch (e: any) {
      console.error(e);
      if (e?.message !== 'Failed to fetch') {
        setError(
          typeof e === 'string'
            ? e
            : e?.message || 'Unknown Verification Error.',
        );
      }
      setStep('pubkey');
    }
  }, []);

  const handleFileUpload = useCallback(
    async (file: any): Promise<void> => {
      if (file.type !== 'application/json') {
        setError('Please upload a valid JSON file.');
        return;
      }

      if (file.size >= 1024 * 1024) {
        setError('File size exceeds the maximum limit (1MB).');
        return;
      }

      setError('');

      const { readFileAsync, safeParseJSON } = await import('../../utils');
      const proofContent = await readFileAsync(file);
      const json: Attestation = safeParseJSON(proofContent);

      if (!json) {
        setError(proofContent || 'Invalid proof');
        return;
      }

      setRawJson(json);

      // if (!json?.notaryUrl) {
      //   setStep('pubkey');
      //   setFile(file);
      //   return;
      // }

      try {
        await onVerify(json);
        setFile(file);
      } catch (e: any) {
        setError(e?.message || 'Invalid proof');
      }
    },
    [dispatch, onVerify],
  );

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();

      try {
        setUploading(true);
        const files = e.target.files;
        if (files && files.length > 0) {
          await handleFileUpload(files[0]);
        }
      } finally {
        setUploading(false);
      }
    },
    [handleFileUpload],
  );

  const onPubkeyChange = useCallback(
    async (key: string) => {
      setPubkey(key);
      if (rawJson) {
        await onVerify(rawJson, key);
      }
    },
    [rawJson, onVerify],
  );

  return (
    <div className="flex flex-col items-center w-full h-screen m-auto gap-2">
      {!!file && (
        <FileDropdown
          files={[file]}
          onChange={() => null}
          onDelete={() => {
            setFile(null);
            setError('');
            setPubkey('');
            setVerifiedProof(null);
            setRawJson(null);
            setStep('upload');
          }}
        />
      )}
      {error && (
        <span className="text-red-500 text-sm w-2/3 text-center">{error}</span>
      )}
      {(() => {
        switch (step) {
          case 'upload':
            return (
              <FileUploadInput
                className="h-[24rem] w-2/3 flex-shrink-0"
                onFileChange={onFileChange}
                loading={uploading}
              />
            );
          case 'pubkey':
            return (
              <PubkeyInput
                className="w-2/3 flex-shrink-0"
                proof={rawJson}
                setError={setError}
                onNext={onPubkeyChange}
              />
            );
          case 'result':
            return !!verifiedProof && !!file ? (
              <ProofViewer
                className="h-4/5 w-2/3 flex-shrink-0"
                verifiedProof={verifiedProof}
                proof={rawJson}
                file={file}
              />
            ) : null;
          default:
            return null;
        }
      })()}
    </div>
  );
}
