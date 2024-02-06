import React, { ReactElement } from 'react';
import { formatStrings, formatTime, extractHTML } from '../../utils';

export default function ProofDetails(proof: any): ReactElement {

// TODO - Format proof details for redacted data
 

  return (
    <div>
      {proof.proof &&
      <div className="flex flex-col gap-3 text-left items-center">
        <span className="font-bold text-2xl">Server Domain:</span>
        <div className="flex items-center h-12 w-4/5 bg-gray-800 text-white rounded">{proof.proof.serverName}</div>
        <span className="font-bold text-2xl">Notarization Time:</span>
        <div className="flex items-center h-12 w-4/5 bg-gray-800 text-white rounded">{formatTime(proof.proof.time)} UTC</div>
        <span className="font-bold text-2xl">Proof:</span>
        <div className="flex items-center h-12 w-4/5 bg-gray-800 text-white rounded">✅ Proof Successfully Verified ✅</div>
        <details open className="w-4/5 items-center">
          <summary className="text-2xl font-bold cursor-pointer text-center">
            Bytes Sent:
          </summary>
          {formatStrings(proof.proof.sent)}
        </details>
        <details open className="w-4/5 items-center">
          <summary className="text-2xl font-bold cursor-pointer text-center">
            Received HTML content:
          </summary>
          {extractHTML(proof.proof.recv)}
        </details>
        <details open className="w-4/5 items-center">
          <summary className="text-2xl font-bold cursor-pointer text-center">
            Bytes Received:
          </summary>
          {formatStrings(proof.proof.recv)}
        </details>

      </div>
      }
    </div>
  )
}
