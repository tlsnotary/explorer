import React, { ReactElement, useState, useCallback, useEffect } from 'react';
import { formatStrings, formatTime, extractHTML } from '../../utils';
import { useSelector, useDispatch } from 'react-redux';
import ProofSelect from '../ProofSelect';
import Modal, { ModalContent, ModalHeader, ModalFooter } from '../Modal';
import { copyText } from '../../utils';
import { useSelectedProof } from '../../store/proofupload';
import { uploadFileToIpfs } from '../../store/upload';
import Icon from '../Icon';

interface ProofDetailsProps {
  proof: any;
  cid?: string;
  file?: File | null;
}

const ProofDetails: React.FC<ProofDetailsProps> = ({proof, cid, file}): ReactElement => {
  const dispatch = useDispatch();
  const selectedProof = useSelectedProof();

  const [isOpen, setIsOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const proofs = useSelector((state: any) => state.proofUpload.proofs);

  useEffect(() => {
    if (file) {
      setFileToUpload(file)
    }
  }, [file])


  const closeModal = useCallback(() => {
    setIsOpen(false)
  }, []);

  const openModal = useCallback(() => {
    setIsOpen(true)
  }, []);

  const handleAccept = useCallback(async () => {
    try {
      if (!fileToUpload) {
        console.error('No file to upload, state might be out of sync');
        return;
      }
      setIsUploading(true);
      const uploadedFile = fileToUpload;
      await dispatch(uploadFileToIpfs(uploadedFile));
      setAccepted(true);
      setIsUploading(false);
    } catch (e) {
      console.error(e);
    }
  }, [fileToUpload]);


  const handleCopyClick: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    await copyText(inputValue);
  };

  const proofToDisplay = selectedProof?.proof || proof;
  const inputValue = process.env.NODE_ENV === "development"
    ? `http://localhost:3000/${selectedProof?.ipfsCID ? selectedProof?.ipfsCID : cid}`
    : `www.tlsnexplorer.com/${selectedProof?.ipfsCID ? selectedProof?.ipfsCID : cid}`;

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
          {isOpen && (
          <Modal
          className="flex flex-col items-center justify-center w-11/12 md:w-3/4 lg:w-2/4 h-auto md:h-auto lg:h-auto bg-white rounded-lg p-4 gap-4"
          onClose={closeModal}>
            <ModalHeader onClose={closeModal}>
              Share Proof
            </ModalHeader>
            <ModalContent className="flex flex-col items-center text-center gap-4">
            <p className='text-red-500 font-bold'>This will make your proof publicly accessible by anyone with the CID</p>
            {!isUploading && (
              accepted ? (
                <div className="relative w-11/12">
                  <input
                    readOnly
                    value={inputValue}
                    className="w-full h-12 bg-gray-800 text-white rounded px-3 pr-10" // Added pr-10 for padding on the right
                  />
                  <button
                  className="absolute top-0 right-0 w-10 h-12 bg-gray-700 text-white flex items-center justify-center hover:bg-gray-500 rounded-r focus:outline-none focus:ring focus:border-blue-500"
                  onClick={handleCopyClick}
                  >
                  <Icon className="fas fa-copy" size={1}/>
                  </button>
                  </div>
              ) : (
                <button className="m-0 w-32 bg-red-200 text-red-500 hover:bg-red-200 hover:text-red-500 hover:font-bold" onClick={handleAccept}>
                  I understand
                </button>
              )
            )}
            {isUploading && (
              <Icon
              className="animate-spin"
              fa="fa-solid fa-spinner"
              size={1}
              />
            )}
            </ModalContent>
            <ModalFooter>
              <button className="m-0 w-24 bg-slate-600 text-slate-200 hover:bg-slate-500 hover:text-slate-100 hover:font-bold" onClick={closeModal}>
                Close
              </button>
            </ModalFooter>
          </Modal>
          )}
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
