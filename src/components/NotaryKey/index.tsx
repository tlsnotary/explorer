import React, { FormEvent, ReactElement, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setKey } from '../../store/notaryKey';


export default function NotaryKey(): ReactElement {
  const dispatch = useDispatch();



  const defaultKey = `-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEBv36FI4ZFszJa0DQFJ3wWCXvVLFr\ncRzMG5kaTeHGoSzDu6cFqx3uEWYpFGo6C0EOUgf+mEgbktLrXocv5yHzKg==\n-----END PUBLIC KEY-----`;
  const notaryPseKey = `-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAExpX/4R4z40gI6C/j9zAM39u58LJu\n3Cx5tXTuqhhu/tirnBi5GniMmspOTEsps4ANnPLpMmMSfhJ+IFHbc3qVOA==\n-----END PUBLIC KEY-----`;

  const [notaryKey, setNotaryKey] = useState(defaultKey);


  const handleInput = (e: FormEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>, key?: string) => {
    if (key) {
      setNotaryKey(key);
      dispatch(setKey(key));
    } else {
      setNotaryKey(e.currentTarget.value);
      dispatch(setKey(e.currentTarget.value));
    }
  }

  return (
    <details className="w-3/4 m-auto">
      <summary className="text-2xl font-bold cursor-pointer">
        Change Notary Public Key:
      </summary>
      <textarea className="w-full h-40 rounded bg-gray-800 text-white resize-none" value={notaryKey} onChange={(e) => handleInput(e)}>
      </textarea>
      <button className="button" onClick={(e) => handleInput(e, notaryPseKey)}>
        notary.pse.dev
      </button>
      <button className="button" onClick={(e) => handleInput(e, defaultKey)}>
        Default
      </button>
    </details>
  )
}
