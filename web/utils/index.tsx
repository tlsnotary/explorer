import React, { ReactElement, useRef } from 'react';

export const readFileAsync = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result) {
        resolve(reader.result.toString());
      } else {
        reject('Failed to read file');
      }
    };

    reader.onerror = () => {
      reject('Failed to read file');
    };

    reader.readAsText(file);
  });
};

export const formatTime = (time: number): string => {
  const date = new Date(time * 1000);
  return date.toLocaleString('en-US', { timeZone: 'UTC', hour12: false });
};

export const formatStrings = (sentData: string): ReactElement => {
  return (
    <pre className="bg-gray-800 text-white h-fill overflow-x-scroll rounded">
      {sentData.split('\n').map((line, index) => (
        // TODO check for redactions

        <React.Fragment key={index}>
          {line}
          <br />
        </React.Fragment>
      ))}
    </pre>
  );
};

export const extractHTML = (receivedData: string): ReactElement => {
  const startIndex = receivedData.indexOf('<!doctype html>');
  const endIndex = receivedData.lastIndexOf('</html>');

  const html = receivedData.substring(startIndex, endIndex);

  return <iframe className="w-full h-auto" srcDoc={html}></iframe>;
};

export const copyText = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    console.error(e);
  }
};

export function safeParseJSON(data: any) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}
