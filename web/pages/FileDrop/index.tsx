import React, { ChangeEvent, ReactElement, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { uploadFile } from '../../store/proofupload';
import { readFileAsync, safeParseJSON } from '../../utils';
import ProofDetails from '../../components/ProofDetails';
import FileUploadInput from '../../components/FileUploadInput';
import classNames from 'classnames';

export default function FileDrop(): ReactElement {
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);
  const [verifiedProof, setVerifiedProof] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'pubkey' | 'result'>('upload');
  const [pubkey, setPubkey] = useState('');

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

      setFile(file);
      setError(null);

      const proofContent = await readFileAsync(file);
      const json = safeParseJSON(proofContent);

      if (!json?.notaryUrl) {
        setStep('pubkey');
        return;
      }

      const { verify } = await import('tlsn-js');

      try {
        const resp = await verify(json);
        setVerifiedProof(resp);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || 'Invalid Proof');
        return;
      }
      dispatch(uploadFile(file.name, verifiedProof));
    },
    [dispatch],
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();

      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [handleFileUpload],
  );

  return (
    <div className="h-screen w-4/5 m-auto ">
      {(() => {
        switch (step) {
          case 'upload':
            return (
              <FileUploadInput
                className="h-[32rem]"
                onFileChange={onFileChange}
              />
            );
          case 'pubkey':
            return (
              <PubkeyInput
                onNext={() => null}
                onBack={() => setStep('upload')}
              />
            );
          case 'result':
          default:
            return null;
        }
      })()}
      {!error && <ProofDetails proof={verifiedProof} file={file} />}
      {error}
    </div>
  );
}

function PubkeyInput(props: {
  onNext: () => void;
  onBack: () => void;
  className?: string;
}) {
  const [error, setError] = useState('');
  const [pubkey, setPubkey] = useState('');

  const isValidPEMKey = (key: string): boolean => {
    try {
      const trimmedKey = key.trim();
      if (
        !trimmedKey.startsWith('-----BEGIN PUBLIC KEY-----') ||
        !trimmedKey.endsWith('-----END PUBLIC KEY-----')
      ) {
        setError('Invalid PEM format: header or footer missing');
        return false;
      }
      const keyContent = trimmedKey
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .trim();

      try {
        atob(keyContent);
      } catch (err) {
        setError('Invalid Base64 encoding');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error validating key:', err);
      return false;
    }
  };

  const onChange = useCallback(
    async (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (isValidPEMKey(e.target.value)) {
        const pubkey = e.target.value;
        console.log(pubkey);
      }
    },
    [pubkey],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="font-semibold">Please enter the notary key:</div>
      <textarea
        className="outline-0 flex-grow w-full bg-slate-200 rouned-xs !border border-slate-200 focus-within:border-slate-500 resize-none p-2 h-[32rem]"
        onChange={onChange}
        placeholder={`-----BEGIN PUBLIC KEY-----\n\n-----END PUBLIC KEY-----`}
      />
      <div className="flex flex-row justify-end gap-2 items-center">
        {error && <span className="text-red-500 text-sm">{error}</span>}
        <button className="button self-start" onClick={props.onBack}>
          Back
        </button>
        <button
          className="button button--primary self-start"
          onClick={props.onNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}
