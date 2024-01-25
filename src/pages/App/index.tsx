import React, { ReactElement } from 'react';
import './index.scss';
import Button from '../../components/Button';
import Header from '../../components/Header';
import { useDispatch } from 'react-redux';
import { asyncIncrementCounter, incrementCounter, useCounter, useLoading } from '../../store/counter';
import FileDrop from '../../components/FileUpload';

export default function App(): ReactElement {
  const dispatch = useDispatch();
  const counter = useCounter();
  const loading = useLoading();

  return (
    <div className="app flex flex-col gap-4">
      <Header />
      {/* {`Clicked ${counter} times`}
      <Button className="w-fit" onClick={() => dispatch(incrementCounter())}>
        Increment
      </Button>
      <Button className="w-fit" onClick={() => dispatch(asyncIncrementCounter(1000))} loading={loading}>
        Wait 1s + Increment
      </Button> */}
      <FileDrop />
    </div>
  );
}
