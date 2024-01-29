import React, { ReactElement } from 'react';
import classNames from 'classnames';
import './index.scss';

export default function Header(): ReactElement {


  return (
    <header className="flex flex-row items-center justify-between h-16 px-4 bg-gray-800 text-white">
        <div className="text-xl font-bold">TLSN Explorer</div>
      <div className="flex flex-row items-center gap-4">
        <a href="https://tlsnotary.org/"
         className="flex flex-row items-center justify-center w-40 h-10 rounded button"
           target="_blank">
          About TLSNotary
        </a>
        <a href="https://github.com/tlsnotary/explorer" className="
          flex flex-row items-center justify-center
          w-16 h-10 button rounded
        " target="_blank">
          Source
        </a>
      </div>
    </header>
  )
}
