import React, { ReactElement } from 'react';
import './index.scss';
import Header from '../../components/Header';
import { useDispatch } from 'react-redux';
import FileDrop from '../../components/FileUpload';

export default function App(): ReactElement {
  const dispatch = useDispatch();

  return (
    <div className="app flex flex-col gap-4">
      <Header />
      <FileDrop />
    </div>
  );
}
