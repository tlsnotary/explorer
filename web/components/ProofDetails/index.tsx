import React, { ReactElement, useState } from 'react';
import { formatStrings, formatTime, extractHTML } from '../../utils';
import { useSelector } from 'react-redux';
import ProofSelect from '../ProofSelect';
import Modal from '../Modal';
import { copyText } from '../../utils';

interface ProofDetailsProps {
  proof: any;
  cid?: string;
}

const ProofDetails: React.FC<ProofDetailsProps> = ({proof, cid}): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedProof = useSelector((state: any) => state.proofUpload.selectedProof);
  const proofs = useSelector((state: any) => state.proofUpload.proofs);

  const proofToDisplay = selectedProof?.proof || proof;

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  const inputValue = `http://localhost:3000/${selectedProof?.ipfsCID ? selectedProof?.ipfsCID : cid}`;

  const handleCopyClick: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    await copyText(inputValue);
  };

  // TODO - Format proof details for redacted data
  return (
    <div>
      {proofToDisplay && (
        <div className="flex flex-col gap-3 text-left items-center">
          <div className='flex flex-row gap-3'>
          {proofs.length > 1 && <ProofSelect />}
          <button onClick={openModal} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Share
          </button>
          <Modal isOpen={isOpen} closeModal={closeModal}>
            <h1 className='text-2xl font-bold mb-4'>Share {selectedProof?.fileName}</h1>
            <p className='text-red-500 font-bold'>This will make your proof publicly accessible by anyone with the CID</p>
            <div className='flex flex-col content-center items-center w-auto w-11/12'>
              <input readOnly value={inputValue} className="w-4/5 h-12 bg-gray-800 text-white rounded" />
              <button onClick={handleCopyClick}><i className="fas fa-copy"></i></button>
            </div>
          </Modal>
          </div>
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

export default ProofDetails
