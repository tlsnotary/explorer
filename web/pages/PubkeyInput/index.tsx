import React, { ChangeEvent, useCallback, useState } from 'react';
import classNames from 'classnames';

export function PubkeyInput(props: {
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
