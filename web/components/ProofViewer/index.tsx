import React, {
  ReactNode,
  ReactElement,
  useState,
  MouseEventHandler,
} from 'react';
import c from 'classnames';
import classNames from 'classnames';
import { Proof as VerifiedProof } from '../types/types';
import { Proof } from 'tlsn-js/build/types';

export default function ProofViewer(props: {
  verifiedProof: VerifiedProof;
  proof: Proof;
  className?: string;
}): ReactElement {
  const [tab, setTab] = useState('sent');

  return (
    <div className={classNames('flex flex-col py-2 gap-2', props.className)}>
      <div className="flex flex-col px-2">
        <div className="flex flex-row gap-2 items-center">
          <TabLabel onClick={() => setTab('sent')} active={tab === 'sent'}>
            Sent
          </TabLabel>
          <TabLabel onClick={() => setTab('recv')} active={tab === 'recv'}>
            Recv
          </TabLabel>
          <div className="flex flex-row flex-grow items-center justify-end">
            <button className="button" onClick={async () => {}}>
              Share
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-grow px-2">
        {tab === 'sent' && (
          <textarea
            className="w-full resize-none bg-slate-100 text-slate-800 border p-2 text-xs break-all h-full outline-none font-mono"
            value={props.verifiedProof.sent}
          ></textarea>
        )}
        {tab === 'recv' && (
          <textarea
            className="w-full resize-none bg-slate-100 text-slate-800 border p-2 text-xs break-all h-full outline-none font-mono"
            value={props.verifiedProof.recv}
          ></textarea>
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
