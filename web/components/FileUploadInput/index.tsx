import Icon from '../Icon';
import React from 'react';
import classNames from 'classnames';

export default function FileUploadInput(props: {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <div
      className={classNames(
        'flex flex-col flex-nowrap overflow-y-auto',
        props.className,
      )}
    >
      <div className="flex flex-col items-center justify-center relative border-slate-400 hover:border-slate-600 border-2 text-slate-500 border-dashed flex-grow flex-shrink h-0 m-2 bg-slate-200 gap-2">
        {props.loading ? (
          <>
            <Icon
              className="animate-spin mb-4"
              fa="fa-solid fa-spinner"
              size={2}
            />
            <div className="text-lg">Drop your proof here to continue</div>
          </>
        ) : (
          <>
            <input
              type="file"
              className="absolute w-full h-full top-0 left-0 opacity-0 z-10 cursor-pointer"
              onChange={props.onFileChange}
              accept=".json"
              disabled={props.disabled || props.loading}
            />
            <Icon className="mb-4" fa="fa-solid fa-upload" size={2} />
            <div className="text-lg">Drop your proof here to continue</div>
            <div className="text-sm">or</div>
            <button
              className="button !bg-primary/[.8] !hover:bg-primary/[.7] !active:bg-primary !text-white"
              onClick={() => null}
            >
              Browse Files
            </button>
          </>
        )}
      </div>
    </div>
  );
}
