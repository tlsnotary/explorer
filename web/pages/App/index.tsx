import React, { ReactElement } from 'react';
import './index.scss';
import Header from '../../components/Header';
import { Routes, Route } from 'react-router-dom';
import FileDrop from '../../components/FileUpload';
import SharedProof from '../../components/SharedProof';

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
