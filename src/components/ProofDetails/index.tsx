import React, { ReactElement } from 'react';


export default function ProofDetails(proof: any): ReactElement {

  const formatTime = (time: number): string => {
    const date = new Date(time * 1000);
    return date.toLocaleString('en-US', { timeZone: 'UTC', hour12: false });
  }

  const formatStrings = (sentData: string): ReactElement => {
    return (
      <pre className='bg-gray-800 text-white h-fill overflow-x-scroll'>{sentData.split('\n').map((line, index) => <React.Fragment key={index}>{line}<br /></React.Fragment>)}</pre>
    );
  };

  const extractHTML = (receivedData: string): ReactElement => {
    const startIndex = receivedData.indexOf('<!doctype html>');
    const endIndex = receivedData.lastIndexOf('</html>') + '</html>'.length;

    const html = receivedData.substring(startIndex, endIndex);

    return <iframe className="w-full h-auto" srcDoc={html}></iframe>

  };


  return (
    <div>
      {proof.proof &&
      <div className="flex flex-col text-left items-center">
        <span className="font-bold text-2xl">Server Domain:</span>
        <div className="flex items-center h-12 w-4/5 bg-gray-800 text-white">{proof.proof.serverName}</div>
        <span className="font-bold text-2xl">Notarization Time:</span>
        <div className="flex items-center h-12 w-4/5 bg-gray-800 text-white">{formatTime(proof.proof.time)} UTC</div>
        <span className="font-bold text-2xl">Proof:</span>
        <div className="flex items-center h-12 w-4/5 bg-gray-800 text-white">✅ Proof Successfully Verified ✅</div>
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
