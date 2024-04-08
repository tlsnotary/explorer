import React, { ReactElement, useState, useCallback, useEffect } from 'react';
import Modal, { ModalContent, ModalHeader, ModalFooter } from '../Modal';



export default function PluginUI(): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [functionName, setFunctionName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState('');

  const closeModal = useCallback(() => {
    setIsOpen(false)
  }, []);

  const openModal = useCallback(() => {
    setIsOpen(true)
  }, []);

  const handleFileInput = useCallback(async () => {
    const formData = new FormData();

    if (file) {
      formData.append('wasmFile', file);
    }

    formData.append('func', functionName);
    formData.append('input', input);

    const res = await fetch('/callPlugin', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    setOutput(data);
  }, [file, functionName, input]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files![0]);
  }, []);

  return (
    <div>
      <button onClick={openModal} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Plugins
      </button>
      {isOpen && (
        <Modal className="flex flex-col items-center justify-center w-11/12 md:w-3/4 lg:w-2/4 bg-white rounded-lg p-4 gap-4" onClose={closeModal}>
          <ModalHeader>
            <h2 className="text-lg font-semibold">Plugins</h2>
          </ModalHeader>
          <ModalContent className="flex flex-col items-center justify-center p-2 gap-4">
            <input
              id="file-upload"
              type="file"
              onChange={handleFile}
              accept=".wasm"
              className="border rounded p-2"
            />
            <input
              onChange={e => setFunctionName(e.target.value)}
              className="border rounded p-2"
              placeholder="Function Name"
            />
            <input
              onChange={e => setInput(e.target.value)}
              className="border rounded p-2"
              placeholder="Input"
            />
            <button onClick={handleFileInput} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Run Plugin
            </button>
            {output && (
              <div>{output}</div>
            )}
          </ModalContent>
          <ModalFooter className="rounded-b-lg p-2">
            <button onClick={closeModal} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Close
            </button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  )};
