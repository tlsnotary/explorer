import React, { ReactElement } from 'react';
import { formatStrings, formatTime, extractHTML } from '../../utils';
import { useSelector } from 'react-redux';
import ProofSelect from '../ProofSelect';
export default function ProofDetails(proof: any): ReactElement {

  const selectedProof = useSelector((state: any) => state.proofUpload.selectedProof);

  const proofToDisplay = selectedProof?.proof || proof?.proof;


  // TODO - Format proof details for redacted data

  return (
    <div>
      {proofToDisplay && (
        <div className="flex flex-col gap-3 text-left items-center">
          <ProofSelect />
          <span className="font-bold text-2xl">Server Domain:</span>
          <div className="flex items-center h-12 w-4/5 bg-gray-800 text-white rounded">{proofToDisplay.serverName}</div>
          <span className="font-bold text-2xl">Notarization Time:</span>
          <div className="flex items-center h-12 w-4/5 bg-gray-800 text-white rounded">{formatTime(proofToDisplay.time)} UTC</div>
          <span className="font-bold text-2xl">Proof:</span>
          <div className="flex items-center h-12 w-4/5 bg-gray-800 text-white rounded">✅ Proof Successfully Verified ✅</div>
          <details open className="w-4/5 items-center">
            <summary className="text-2xl font-bold cursor-pointer text-center">
              Bytes Sent:
            </summary>
            {formatStrings(proofToDisplay.sent)}
          </details>
          <details open className="w-4/5 items-center">
            <summary className="text-2xl font-bold cursor-pointer text-center">
              Received HTML content:
            </summary>
            {extractHTML(proofToDisplay.recv)}
          </details>
          <details open className="w-4/5 items-center">
            <summary className="text-2xl font-bold cursor-pointer text-center">
              Bytes Received:
            </summary>
            {formatStrings(proofToDisplay.recv)}
          </details>
        </div>
      )}
    </div>
  );
}
