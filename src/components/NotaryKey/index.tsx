import React, { FormEvent, ReactElement, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setKey } from '../../store/notaryKey';


export default function NotaryKey(): ReactElement {
  const dispatch = useDispatch();

  const defaultKey: string = `-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEBv36FI4ZFszJa0DQFJ3wWCXvVLFr\ncRzMG5kaTeHGoSzDu6cFqx3uEWYpFGo6C0EOUgf+mEgbktLrXocv5yHzKg==\n-----END PUBLIC KEY-----`;
  const notaryPseKey: string = `-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAExpX/4R4z40gI6C/j9zAM39u58LJu\n3Cx5tXTuqhhu/tirnBi5GniMmspOTEsps4ANnPLpMmMSfhJ+IFHbc3qVOA==\n-----END PUBLIC KEY-----`;

  const [notaryKey, setNotaryKey] = useState<string>(defaultKey);
  const [errors, setError] = useState<string | null>(null);



  const isValidPEMKey = (key: string): boolean => {
    const pemRegex = /^-----BEGIN (?:[A-Z]+ )?PUBLIC KEY-----\n(?:[A-Za-z0-9+\/=]+\n)+-----END (?:[A-Z]+ )?PUBLIC KEY-----$/;
    if (!pemRegex.test(key)) {
      setError('Key does not match PEM format.');
      return false;
    }
    try {
      const base64Data = key.replace(/-----BEGIN (?:[A-Z]+ )?PUBLIC KEY-----\n/, '').replace(/\n-----END (?:[A-Z]+ )?PUBLIC KEY-----$/, '');
      atob(base64Data);
    } catch (err) {
      setError('Invalid Base64 encoding.');
      return false;
    }
    return true;
  };

  const handleInput = (e: FormEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>, key?: string | undefined) => {
    setError(null);
    const keyInput = key !== undefined ? key : (e.currentTarget instanceof HTMLTextAreaElement ? e.currentTarget.value : '');
    if (isValidPEMKey(keyInput)) {
      setNotaryKey(keyInput);
      dispatch(setKey(keyInput));
    } else {
      setNotaryKey(keyInput);
      setError('Invalid PEM-encoded public key.');
    }
  }

  return (
    <details className="w-3/4 m-auto">
      <summary className="text-2xl font-bold cursor-pointer">
        Change Notary Public Key:
      </summary>
      <textarea className="w-full h-40 rounded bg-gray-800 text-white resize-none" value={notaryKey} onChange={(e) => handleInput(e)}>
      </textarea>
      {errors && <p className="text-red-500">{errors}</p>}
      <button className="button" onClick={(e) => handleInput(e, notaryPseKey)}>
        notary.pse.dev
      </button>
      <button className="button" onClick={(e) => handleInput(e, defaultKey)}>
        Default
      </button>
    </details>
  )
}
