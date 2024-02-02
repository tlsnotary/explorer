import React, { FormEvent, ReactElement, useState } from 'react';
import { useDispatch } from 'react-redux';


export default function NotaryKey(): ReactElement {
  const dispatch = useDispatch();


  const defaultKey = `-----BEGIN PUBLIC KEY-----
  MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEBv36FI4ZFszJa0DQFJ3wWCXvVLFr
  cRzMG5kaTeHGoSzDu6cFqx3uEWYpFGo6C0EOUgf+mEgbktLrXocv5yHzKg==
  -----END PUBLIC KEY-----`

  const notaryPseKey = `-----BEGIN PUBLIC KEY-----
  MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAExpX/4R4z40gI6C/j9zAM39u58LJu
  3Cx5tXTuqhhu/tirnBi5GniMmspOTEsps4ANnPLpMmMSfhJ+IFHbc3qVOA==
  -----END PUBLIC KEY-----`

  const [notaryKey, setNotaryKey] = useState(defaultKey);

  const handleInput = (e: FormEvent<HTMLTextAreaElement>) => {
    setNotaryKey(e.currentTarget.value)
  }


  return (
    <details className="w-3/4 m-auto">
      <summary className="text-2xl font-bold cursor-pointer">
        Change Notary Public Key:
      </summary>
      <textarea className="w-full h-40 rounded bg-gray-800 text-white resize-none" value={notaryKey} onChange={(e) => handleInput(e)}>
      </textarea>
      <button className="button" onClick={() => setNotaryKey(notaryPseKey)}>
        notary.pse.dev
      </button>
      <button className="button" onClick={() => setNotaryKey(defaultKey)}>
        Default
      </button>
    </details>
  )
}
