import React, { FormEvent, ReactElement, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setKey } from '../../store/notaryKey';
import keys from '../../utils/keys.json';

export default function NotaryKey(): ReactElement {
  const dispatch = useDispatch();

  const defaultKey: string = keys.defaultKey
  const notaryPseKey: string = keys.notaryPseKey

  const [notaryKey, setNotaryKey] = useState<string>(defaultKey);
  const [errors, setError] = useState<string | null>(null);


  const isValidPEMKey = (key: string): boolean => {
    try {
      const trimmedKey = key.trim();
      if (!trimmedKey.startsWith('-----BEGIN PUBLIC KEY-----') || !trimmedKey.endsWith('-----END PUBLIC KEY-----')) {
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


  const handleInput = (e: FormEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>, key?: string | undefined) => {
    setError(null);
    const keyInput = key !== undefined ? key : (e.currentTarget instanceof HTMLTextAreaElement ? e.currentTarget.value : '');
    if (isValidPEMKey(keyInput)) {
      setNotaryKey(keyInput);
      dispatch(setKey(keyInput));
    } else {
      setNotaryKey(keyInput);
    }
  }

  return (
    <details className="w-3/4 mx-auto">
      <summary className="text-2xl font-bold cursor-pointer">
        Change Notary Public Key:
      </summary>
      <textarea
        className="w-full h-40 rounded bg-gray-800 text-white resize-none mt-4 p-4"
        value={notaryKey}
        onChange={(e) => handleInput(e)}
      />
      {errors && <p className="text-red-500 mt-2">{errors}</p>}
      <div className="flex mt-4">
        <button
          className="button"
          onClick={(e) => handleInput(e, notaryPseKey)}
        >
          notary.pse.dev
        </button>
        <button
          className="button"
          onClick={(e) => handleInput(e, defaultKey)}
        >
          Default
        </button>
      </div>
    </details>
  )
}
