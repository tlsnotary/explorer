import React, { ReactElement } from 'react';
import Logo from '../../../static/logo.svg';
import './index.scss';
import Icon from '../Icon';

export default function Header(): ReactElement {
  return (
    <header className="flex flex-row items-center justify-between h-16 px-4 bg-slate-200">
      <img className="w-8 h-8" src={Logo} />
      <div className="flex flex-row items-center">
        <a
          href="https://tlsnotary.org/"
          className="flex flex-row items-center justify-center button !bg-transparent"
          target="_blank"
        >
          <Icon fa="fa-solid fa-globe" />
        </a>
        <a
          href="https://github.com/tlsnotary/explorer"
          className="flex flex-row items-center justify-center button !bg-transparent"
          target="_blank"
        >
          <Icon fa="fa-brands fa-github" />
        </a>
        <a
          href="https://discord.gg/9XwESXtcN7"
          className="flex flex-row items-center justify-center button !bg-transparent"
          target="_blank"
        >
          <Icon fa="fa-brands fa-discord" />
        </a>
      </div>
    </header>
  );
}
