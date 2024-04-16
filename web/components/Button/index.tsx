import React, { ButtonHTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';
import './index.scss';
import Icon from '../Icon';

type Props = {
  className?: string;
  btnType?: 'primary' | 'secondary' | '';
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button(props: Props): ReactElement {
  const {
    className,
    btnType = '',
    children,
    onClick,
    disabled,
    loading,
    // Must select all non-button props here otherwise react-dom will show warning
    ...btnProps
  } = props;
  return (
    <button
      className={classNames(
        'flex flex-row flex-nowrap items-center',
        'h-10 px-4 button transition-colors',
        {
          'button--primary': btnType === 'primary',
          'button--secondary': btnType === 'secondary',
          'cursor-default': disabled || loading,
        },
        className,
      )}
      onClick={!disabled && !loading ? onClick : undefined}
      disabled={disabled || loading}
      {...btnProps}
    >
      {loading ? (
        <Icon className="animate-spin" fa="fa-solid fa-spinner" size={2} />
      ) : (
        children
      )}
    </button>
  );
}
