import React, { FormEvent, ReactElement, useState } from 'react';
import { useDispatch } from 'react-redux';


export default function NotaryKey(): ReactElement {
  const dispatch = useDispatch();

  const defaultKey = `-----BEGIN PUBLIC KEY-----
  MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEBv36FI4ZFszJa0DQFJ3wWCXvVLFr
  cRzMG5kaTeHGoSzDu6cFqx3uEWYpFGo6C0EOUgf+mEgbktLrXocv5yHzKg==
  -----END PUBLIC KEY-----`

  const [notaryKey, setNotaryKey] = useState(defaultKey);

  const handleInput = (e: FormEvent<HTMLTextAreaElement>) => {
    setNotaryKey(e.currentTarget.value)
  }


  return (
    <details>
      <summary className="text-2xl font-bold cursor-pointer">
        Change Notary Public Key:
      </summary>
      <textarea className="w-full h-40 rounded bg-gray-800 text-white" value={notaryKey} onInput={(e) => handleInput(e)}>
      </textarea>
      <button className="button" onClick={() => setNotaryKey('123')}>
        notary.pse.dev
      </button>
      <button className="button" onClick={() => setNotaryKey(defaultKey)}>
        Default
      </button>
    </details>
  )
}
