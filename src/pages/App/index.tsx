import React, { ReactElement } from 'react';
import './index.scss';
import Header from '../../components/Header';
import FileDrop from '../../components/FileUpload';
import { Routes, Route } from 'react-router-dom';
import ProofSelect from '../../components/ProofSelect';

export default function App(): ReactElement {


  return (
    <div className="app flex flex-col gap-4">
      <Header />
      <Routes>
        <Route path="/" element={<FileDrop />} />
      </Routes>
    </div>
  );
}
