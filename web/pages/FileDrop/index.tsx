import React, { ChangeEvent, ReactElement, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { readFileAsync, safeParseJSON } from '../../utils';
import FileUploadInput from '../../components/FileUploadInput';
import classNames from 'classnames';
import ProofViewer from '../../components/ProofViewer';
import { Proof as VerifiedProof } from '../../components/types/types';
import Icon from '../../components/Icon';

export default function FileDrop(): ReactElement {
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);
  const [verifiedProof, setVerifiedProof] = useState<VerifiedProof | null>(
    null,
  );
  const [rawJson, setRawJson] = useState<any | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'pubkey' | 'result'>('upload');
  const [pubkey, setPubkey] = useState('');
  const [uploading, setUploading] = useState(false);

  const onVerify = useCallback(
    async (json: any) => {
      const { verify } = await import('tlsn-js');

      try {
        const resp = await verify(json, pubkey);
        setVerifiedProof(resp);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || 'Invalid Proof');
        throw new e();
      }

      setStep('result');
      // dispatch(uploadFile(file.name, verifiedProof));
    },
    [pubkey],
  );

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

      setError(null);

      const proofContent = await readFileAsync(file);
      const json = safeParseJSON(proofContent);

      if (!json) {
        setError(proofContent || 'Invalid proof');
        return;
      }

      setRawJson(json);

      if (!json?.notaryUrl) {
        setStep('pubkey');
        setFile(file);
        return;
      }

      onVerify(json).then(() => setFile(file));
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
        await onVerify(rawJson);
      }
    },
    [rawJson, onVerify],
  );

  return (
    <div className="flex flex-col items-center w-full h-screen m-auto gap-2">
      {!!file && (
        <div className="flex flew-row bg-yellow-100 border border-yellow-200 text-yellow-700 gap-2 p-2 rounded max-w-60">
          <Icon
            className="text-yellow-500 flex-shrink-0"
            fa="fa-solid fa-file"
          />
          <div className="select-none flex-grow flex-shrink text-ellipsis overflow-hidden">
            {file.name}
          </div>
          <Icon
            fa="fa-solid fa-close flex-shrink-0"
            className="text-red-300 hover:text-red-500"
            onClick={() => {
              setFile(null);
              setError('');
              setPubkey('');
              setVerifiedProof(null);
              setRawJson(null);
              setStep('upload');
            }}
          />
        </div>
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
                onNext={onPubkeyChange}
                onBack={() => setStep('upload')}
              />
            );
          case 'result':
            return verifiedProof ? (
              <ProofViewer
                className="h-4/5 w-2/3 flex-shrink-0"
                verifiedProof={verifiedProof}
                proof={rawJson}
              />
            ) : null;
          default:
            return null;
        }
      })()}
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
}

function PubkeyInput(props: {
  onNext: (pubkey: string) => void;
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
      setError('');
      const pubkey = e.target.value;
      console.log(pubkey);
      setPubkey(pubkey);
    },
    [pubkey],
  );

  const onNext = useCallback(() => {
    if (isValidPEMKey(pubkey)) {
      props.onNext(pubkey);
    }
  }, [pubkey]);

  return (
    <div className={classNames('flex flex-col gap-2', props.className)}>
      <div className="font-semibold">Please enter the notary key:</div>
      <textarea
        className="outline-0 flex-grow w-full bg-slate-100 rouned-xs !border border-slate-300 focus-within:border-slate-500 resize-none p-2 h-[24rem]"
        onChange={onChange}
        placeholder={`-----BEGIN PUBLIC KEY-----\n\n-----END PUBLIC KEY-----`}
      />
      <div className="flex flex-row justify-end gap-2 items-center">
        {error && <span className="text-red-500 text-sm">{error}</span>}
        <button
          className="button button--primary self-start"
          onClick={onNext}
          disabled={!pubkey || !!error}
        >
          Next
        </button>
      </div>
    </div>
  );
}
