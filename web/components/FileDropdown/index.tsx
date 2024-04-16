import React, { ReactElement } from 'react';
import Icon from '../Icon';

export function FileDropdown(props: {
  files: File[];
  onDelete: (fileIndex: number) => void;
  onChange: (fileIndex: number) => void;
}): ReactElement {
  const file = props.files[0];

  if (!file) return <></>;

  return (
    <div className="flex flew-row bg-slate-100 border border-slate-200 text-slate-700 gap-2 p-2 rounded max-w-80">
      <Icon className="text-slate-500 flex-shrink-0" fa="fa-solid fa-file" />
      <div className="select-none flex-grow flex-shrink text-ellipsis overflow-hidden whitespace-nowrap">
        {file.name}
      </div>
      <Icon
        fa="fa-solid fa-close flex-shrink-0"
        className="text-slate-300 hover:text-red-500"
        onClick={() => props.onDelete(0)}
      />
    </div>
  );
}
