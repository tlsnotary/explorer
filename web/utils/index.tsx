import React, { ReactElement, useRef } from 'react';
import { Attestation, AttestedData } from './types/types';

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

export function download(filename: string, content: string) {
  if (typeof document === 'undefined') return;

  const element = document.createElement('a');
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(content),
  );
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

let tlsnInitPromise: Promise<any> | null = null;
async function initTlsnJs() {
  if (tlsnInitPromise) return tlsnInitPromise;
  const { promise, resolve } = defer();
  tlsnInitPromise = promise;

  const { default: init } = await import('tlsn-js');
  await init();
  resolve();
}

export async function verify(
  attestation: Attestation,
  pubKey: string,
): Promise<AttestedData> {
  let key = pubKey;
  const { NotaryServer } = await import('tlsn-js');
  await initTlsnJs();

  switch (attestation.version) {
    case undefined: {
      const { verify } = await import('tlsn-js-v5');
      key =
        key ||
        (await NotaryServer.from(attestation.notaryUrl).publicKey('pem'));
      const data = await verify(attestation, key);
      return {
        ...data,
        version: '0.1.0-alpha.5',
        notaryUrl: attestation.notaryUrl,
        notaryKey: key,
      };
    }
    case '0.1.0-alpha.7': {
      const { Presentation, Transcript } = await import('tlsn-js');
      const tlsProof = new Presentation(attestation.data);
      const data = await tlsProof.verify();
      const transcript = new Transcript({
        sent: data.transcript.sent,
        recv: data.transcript.recv,
      });
      const vk = await tlsProof.verifyingKey();
      const verifyingKey = Buffer.from(vk.data).toString('hex');
      const notaryUrl = convertNotaryWsToHttp(attestation.meta.notaryUrl);
      const publicKey = await new NotaryServer(notaryUrl).publicKey();

      return {
        version: '0.1.0-alpha.7',
        sent: transcript.sent(),
        recv: transcript.recv(),
        time: data.connection_info.time,
        notaryUrl: notaryUrl,
        notaryKey: publicKey,
        websocketProxyUrl: attestation.meta.websocketProxyUrl,
        verifierKey: verifyingKey,
      };
    }
  }

  throw new Error('Invalid Proof');
}

export function convertNotaryWsToHttp(notaryWs: string) {
  const { protocol, pathname, hostname, port } = new URL(notaryWs);
  const p = protocol === 'wss:' ? 'https:' : 'http:';
  const pt = port ? `:${port}` : '';
  const path = pathname === '/' ? '' : pathname.replace('/notarize', '');
  return p + '//' + hostname + pt + path;
}

function defer(): {
  promise: Promise<any>;
  resolve: (args?: any) => any;
  reject: (args?: any) => any;
} {
  let resolve: any, reject: any;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    promise,
    resolve: resolve as (args?: any) => any,
    reject: reject as (args?: any) => any,
  };
}
