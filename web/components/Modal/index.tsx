import React, { FC, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  children: React.ReactNode;
}

const modalRoot = document.getElementById('modal-root')!;

const Modal: FC<ModalProps> = ({ isOpen, closeModal, children }) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return;
      const target = event.target as HTMLElement;
      if (!target.closest('.modal-content')) {
        closeModal();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, closeModal]);

  return isOpen
    ? createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col items-center justify-items-center content-center bg-white p-8 rounded-lg modal-content">
            {children}
          </div>
        </div>,
        modalRoot
      )
    : <></>;
};
 
export default Modal;
