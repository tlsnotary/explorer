import React, { ReactElement } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '../../components/Header';
import SharedProof from '../../components/SharedProof';
import FileDrop from '../FileDrop';
import './index.scss';

export default function App(): ReactElement {
  return (
    <div className="app flex flex-col gap-4">
      <Header />
      <Routes>
        <Route path="/" element={<FileDrop />} />
        <Route path="/ipfs/:cid" element={<SharedProof />} />
      </Routes>
    </div>
  );
}
