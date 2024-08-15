import React, {
  ReactNode,
  ReactElement,
  useState,
  MouseEventHandler,
  useCallback,
} from 'react';
import c from 'classnames';
import classNames from 'classnames';
import { Proof as VerifiedProof } from '../../utils/types/types';
import { Proof } from 'tlsn-js/build/types';
import Modal, { ModalContent, ModalFooter, ModalHeader } from '../Modal';
import Icon from '../Icon';
import { useDispatch } from 'react-redux';
import { uploadFileToIpfs } from '../../store/upload';
import { setIPFSProof } from '../../store/proofs';
import { EXPLORER_URL } from '../../utils/constants';
import copy from 'copy-to-clipboard';

export default function ProofViewer(props: {
  file: File;
  verifiedProof: VerifiedProof;
  proof: Proof;
  className?: string;
}): ReactElement {
  const [tab, setTab] = useState('sent');
  const [showingShareWarning, showShareWarning] = useState(false);
  const [showingIPFSLink, showIPFSLink] = useState(false);
  const dispatch = useDispatch();
  const [cid, setCID] = useState('');

  const onClickShare = useCallback(() => {
    if (!showingShareWarning) return showShareWarning(true);
  }, [showingShareWarning]);

  const onUpload = useCallback(async () => {
    const cid = await dispatch(uploadFileToIpfs(props.file));
    dispatch(
      setIPFSProof({ cid, proof: props.verifiedProof, raw: props.proof }),
    );
    setCID(cid);
    showShareWarning(false);
    showIPFSLink(true);
  }, [props.file, props.verifiedProof, props.proof]);

  return (
    <div className={classNames('flex flex-col py-2 gap-2', props.className)}>
      {showingShareWarning && (
        <ShareWarningModal
          onClose={() => showShareWarning(false)}
          onUpload={onUpload}
        />
      )}
      {showingIPFSLink && (
        <IPFSLinkModal cid={cid} onClose={() => showIPFSLink(false)} />
      )}
      <div className="flex flex-col px-2">
        <div className="flex flex-row gap-2 items-center">
          <TabLabel onClick={() => setTab('info')} active={tab === 'info'}>
            Info
          </TabLabel>
          <TabLabel onClick={() => setTab('sent')} active={tab === 'sent'}>
            Sent
          </TabLabel>
          <TabLabel onClick={() => setTab('recv')} active={tab === 'recv'}>
            Recv
          </TabLabel>
          <div className="flex flex-row flex-grow items-center justify-end">
            <button className="button" onClick={onClickShare}>
              Share
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-grow px-2">
        {tab === 'info' && (
          <div className="w-full bg-slate-100 text-slate-800 border p-2 text-xs break-all h-full outline-none font-mono">
            <div>
              <div>Notary URL:</div>
              <div>{props.proof.notaryUrl}</div>
            </div>
          </div>
        )}
        {tab === 'sent' && (
          <textarea
            className="w-full resize-none bg-slate-100 text-slate-800 border p-2 text-xs break-all h-full outline-none font-mono"
            value={props.verifiedProof.sent}
            readOnly
          />
        )}
        {tab === 'recv' && (
          <textarea
            className="w-full resize-none bg-slate-100 text-slate-800 border p-2 text-xs break-all h-full outline-none font-mono"
            value={props.verifiedProof.recv}
            readOnly
          />
        )}
      </div>
    </div>
  );
}

function TabLabel(props: {
  children: ReactNode;
  onClick: MouseEventHandler;
  active?: boolean;
}): ReactElement {
  return (
    <button
      className={c('px-1 select-none cursor-pointer font-bold', {
        'text-slate-800 border-b-2 border-green-500': props.active,
        'text-slate-400 border-b-2 border-transparent hover:text-slate-500':
          !props.active,
      })}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

function ShareWarningModal(props: {
  onClose: () => void;
  onUpload: () => Promise<void>;
}): ReactElement {
  const [error, showError] = useState('');
  const [uploading, setUploading] = useState(false);
  const onUpload = useCallback(async () => {
    try {
      setUploading(true);
      await props.onUpload();
    } catch (e: any) {
      showError(e?.message || 'Unknown upload error');
    } finally {
      setUploading(false);
    }
  }, []);

  return (
    <Modal className="w-2/3 max-w-[45rem]" onClose={props.onClose}>
      <ModalHeader>Sharing a Proof</ModalHeader>
      <ModalContent className="py-2 px-4 text-center">
        This will upload your proof to IPFS. Anyone with the url will be able to
        view your proof. Are you sure you want to proceed?
      </ModalContent>
      <ModalFooter className="flex flex-row items-center gap-2 !py-2 !px-4">
        {!!error && <span className="text-red-500 text-sm">{error}</span>}
        <button
          className="button self-start"
          onClick={props.onClose}
          disabled={uploading}
        >
          Cancel
        </button>
        <button
          className="button button--primary self-start"
          disabled={uploading}
          onClick={onUpload}
        >
          {uploading ? (
            <Icon className="animate-spin" fa="fa-solid fa-spinner" size={1} />
          ) : (
            'Upload'
          )}
        </button>
      </ModalFooter>
    </Modal>
  );
}

function IPFSLinkModal(props: {
  onClose: () => void;
  cid: string;
}): ReactElement {
  const ipfsLink = `${EXPLORER_URL}/ipfs/${props.cid}`;

  return (
    <Modal className="w-2/3 max-w-[45rem]" onClose={props.onClose}>
      <ModalHeader>Sharing a Proof</ModalHeader>
      <ModalContent className="py-2 px-4">
        <input
          readOnly
          value={ipfsLink}
          className="w-full bg-slate-100 border border-slate-300 outline-0 p-2 cursor-pointer"
          onFocus={(e) => e.target.select()}
        />
      </ModalContent>
      <ModalFooter className="flex flex-row items-center gap-2 !py-2 !px-4">
        <button className="button self-start" onClick={props.onClose}>
          Close
        </button>
        <button
          className="button button--primary self-start"
          onClick={() => copy(ipfsLink)}
        >
          Copy
        </button>
      </ModalFooter>
    </Modal>
  );
}
