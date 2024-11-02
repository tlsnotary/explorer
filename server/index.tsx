import 'dotenv/config';
import express from 'express';
import fileUpload from 'express-fileupload';
import stream from 'stream';
import { addBytes, getCID } from './services/ipfs';
import App from '../web/pages/App';
import { Provider } from 'react-redux';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import configureAppStore, { AppRootState } from '../web/store';
// @ts-ignore
import { verify } from '../rs/verifier/index.node';
// @ts-ignore
import { verify as verifyV7 } from '../rs/0.1.0-alpha.7/index.node';
import { Attestation } from '../web/utils/types/types';
import { convertNotaryWsToHttp } from '../web/utils';
import { IncomingMessage } from 'node:http';
import { createServer } from 'http';
import { WebSocketServer, type RawData, type WebSocket } from 'ws';
import crypto from 'crypto';
import qs from 'qs';
import { Mutex } from 'async-mutex';
const mutex = new Mutex();

const app = express();
const port = process.env.PORT || 3000;
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization',
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  );
  res.setHeader('Cross-origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-origin-Opener-Policy', 'same-origin');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.static('build/ui'));
app.use(
  fileUpload({
    limits: { fileSize: 1024 * 1024 }, // 1mb file limit
  }),
);

app.post('/api/upload', async (req, res) => {
  for (const file of Object.values(req.files!)) {
    // @ts-ignore
    const data = file.data;
    const cid = await addBytes(data);
    res.json(cid);
    return;
  }

  res.status(400).send({ error: true, message: 'request is missing file' });
});

app.get('/gateway/ipfs/:cid', async (req, res) => {
  const cid = req.params.cid;
  const file = await getCID(req.params.cid);
  const readStream = new stream.PassThrough();
  readStream.end(Buffer.from(file));
  res.set('Content-Type', 'application/octet-stream');
  res.set('Content-Disposition', `attachment; filename=${cid}.json`);
  readStream.pipe(res);
});

app.get('/ipfs/:cid', async (req, res) => {
  // If there is no file from CID or JSON cannot be parsed, redirect to root
  try {
    const { cid } = req.params;
    const [, isWasm] = cid.split('.');

    if (isWasm) {
      return res.redirect(`/${cid}`);
    }

    const storeConfig: AppRootState = {
      notaryKey: { key: '' },
      proofUpload: {
        proofs: [],
        selectedProof: null,
      },
      proofs: { ipfs: {} },
    };

    const file = await getCID(req.params.cid);
    const jsonProof: Attestation = JSON.parse(file);

    storeConfig.proofs.ipfs[req.params.cid] = {
      raw: jsonProof,
    };

    /**
     * Verify the proof if notary url exist
     * redirect to root if verification fails
     */
    if (!jsonProof.version && jsonProof.notaryUrl) {
      const notaryPem = await fetchPublicKeyFromNotary(jsonProof.notaryUrl);
      const proof = await verify(file, notaryPem);
      proof.notaryUrl = jsonProof.notaryUrl;
      storeConfig.proofs.ipfs[req.params.cid].proof = {
        ...proof,
        version: '0.1.0-alpha.5',
        notaryUrl: jsonProof.notaryUrl,
        notaryKey: notaryPem,
      };
    } else if (jsonProof.version === '0.1.0-alpha.7') {
      const notaryUrl = convertNotaryWsToHttp(jsonProof.meta.notaryUrl);
      const notaryPem = await fetchPublicKeyFromNotary(notaryUrl).catch(
        () => '',
      );
      const proof = await verifyV7(jsonProof.data, notaryPem);
      proof.notaryUrl = jsonProof.meta.notaryUrl;
      storeConfig.proofs.ipfs[req.params.cid].proof = {
        version: '0.1.0-alpha.7',
        time: proof.time,
        sent: proof.sent,
        recv: proof.recv,
        notaryUrl: notaryUrl,
        websocketProxyUrl: jsonProof.meta.websocketProxyUrl,
        notaryKey: Buffer.from(
          notaryPem
            .replace('-----BEGIN PUBLIC KEY-----', '')
            .replace('-----END PUBLIC KEY-----', '')
            .replace(/\n/g, ''),
          'base64',
        )
          .slice(23)
          .toString('hex'),
      };
    }

    const store = configureAppStore(storeConfig);
    const html = renderToString(
      <Provider store={store}>
        <StaticRouter location={req.url}>
          <App />
        </StaticRouter>
      </Provider>,
    );

    const preloadedState = store.getState();

    const imgUrl =
      'data:image/svg+xml,' +
      encodeURIComponent(`
        <svg width="86" height="88" viewBox="0 0 86 88" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M25.5484 0.708986C25.5484 0.17436 26.1196 -0.167376 26.5923 0.0844205L33.6891 3.86446C33.9202 3.98756 34.0645 4.22766 34.0645 4.48902V9.44049H37.6129C38.0048 9.44049 38.3226 9.75747 38.3226 10.1485V21.4766L36.1936 20.0606V11.5645H34.0645V80.9919C34.0645 81.1134 34.0332 81.2328 33.9735 81.3388L30.4251 87.6388C30.1539 88.1204 29.459 88.1204 29.1878 87.6388L25.6394 81.3388C25.5797 81.2328 25.5484 81.1134 25.5484 80.9919V0.708986Z" fill="#243F5F"/>
          <path d="M21.2903 25.7246V76.7012H12.7742V34.2207H0V25.7246H21.2903Z" fill="#243F5F"/>
          <path d="M63.871 76.7012H72.3871V34.2207H76.6452V76.7012H85.1613V25.7246H63.871V76.7012Z" fill="#243F5F"/>
          <path d="M38.3226 25.7246H59.6129V34.2207H46.8387V46.9649H59.6129V76.7012H38.3226V68.2051H51.0968V55.4609H38.3226V25.7246Z" fill="#243F5F"/>
        </svg>`)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta property="og:image" content="${imgUrl}" />
      <title>TLSNotary Explorer</title>
      <script>
        window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState)};
      </script>
      <script defer src="/index.bundle.js"></script>
    </head>
    <body>
      <div id="root">${html}</div>
      <div id="modal-root"></div>
    </body>
    </html>
  `);
  } catch (e) {
    console.error(e);
    res.redirect('/');
    return;
  }
});

app.get('*', (req, res) => {
  const storeConfig: AppRootState = {
    notaryKey: { key: '' },
    proofUpload: {
      proofs: [],
      selectedProof: null,
    },
    proofs: { ipfs: {} },
  };
  const store = configureAppStore(storeConfig);
  const html = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url}>
        <App />
      </StaticRouter>
    </Provider>,
  );

  const preloadedState = store.getState();
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>TLSNotary Explorer</title>
      <script>
        window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState)};
      </script>
      <script defer src="/index.bundle.js"></script>
    </head>
    <body>
      <div id="root">${html}</div>
      <div id="modal-root"></div>
    </body>
    </html>
  `);
});

server.listen(port, () => {
  console.log(`explorer server listening on port ${port}`);
});

const clients: Map<string, WebSocket> = new Map<string, WebSocket>();
const pairs: Map<string, string> = new Map<string, string>();
pairs.set('alice', 'bob');
pairs.set('bob', 'alice');

wss.on('connection', (client: WebSocket, request: IncomingMessage) => {
  // you have a new client
  console.log('New Connection');
  // add this client to the clients array

  const query = qs.parse((request.url || '').replace(/\/\?/g, ''));
  const clientId = (query?.clientId as string) || crypto.randomUUID();
  clients.set(clientId, client);
  console.log(`New Connection - ${clientId}`);

  if (!clientId.includes(':proof')) {
    client.send(
      Buffer.from(
        JSON.stringify({
          method: 'client_connect',
          params: { clientId },
        }),
      ),
    );
  }

  // set up client event listeners:
  client.on('message', onClientMessage);
  client.on('close', endClient);

  function endClient() {
    clients.delete(clientId);
    console.log(`Connection closed - ${clientId}`);
  }

  async function onClientMessage(rawData: RawData) {
    try {
      const msg = safeParseJSON(rawData.toString());

      // console.log(`got msg from ${clientId}: `, msg);

      if (!msg) {
        const [cid] = clientId.split(':');
        const pairedClientId = pairs.get(cid);
        // @ts-ignore
        console.log('p2p: ', rawData.length);
        await send(pairedClientId + ':proof', rawData);

        return;
      }

      const { to } = msg.params;

      console.log(msg.method);

      switch (msg.method) {
        case 'request_proof':
          await send(to, rawData);
          break;
        case 'pair_request':
          if (await send(to, rawData)) {
            await send(clientId, pairRequestSent(to));
          }
          break;
        case 'pair_request_cancel':
          if (await send(to, rawData)) {
            await send(clientId, pairRequestCancelled(to));
          }
          break;
        case 'pair_request_reject':
          if (await send(to, rawData)) {
            await send(clientId, pairRequestRejected(to));
          }
          break;
        case 'pair_request_accept': {
          if (await send(to, rawData)) {
            pairs.set(to, clientId);
            pairs.set(clientId, to);
            await send(clientId, pairRequestSuccess(to));
          }
          break;
        }
        case 'request_proof_by_hash': {
          const { pluginHash } = msg.params;
          if (await send(to, rawData)) {
            await send(clientId, proofRequestReceived(pluginHash));
          }
          break;
        }
        case 'proof_request_cancel': {
          const { pluginHash } = msg.params;
          if (await send(to, rawData)) {
            await send(clientId, proofRequestCancelled(pluginHash));
          }
          break;
        }
        case 'proof_request_reject': {
          const { pluginHash } = msg.params;
          if (await send(to, rawData)) {
            await send(clientId, proofRequestRejected(pluginHash));
          }
          break;
        }
        case 'proof_request_received':
        case 'proof_request_accept':
        case 'verifier_started':
        case 'prover_setup':
        case 'prover_started':
        case 'proof_request_start':
          await send(to, rawData);
          break;
        default:
          // send(to, rawData);
          console.log('unknown msg', msg);
          break;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // This function broadcasts messages to all webSocket clients
  function broadcast(data: string) {
    clients.forEach((c) => c.send(data));
  }

  async function send(clientId: string, data: RawData) {
    return mutex.runExclusive(async () => {
      const res = await new Promise((resolve) => {
        const target = clients.get(clientId);

        if (!target) {
          client.send(clientNotFoundError(clientId), () => {
            resolve(false);
          });
        } else {
          target.send(data, (err) => {
            resolve(!err);
          });
        }
      });

      return res;
    });
  }
});

function clientNotFoundError(clientId: string) {
  return bufferify({
    error: {
      message: `client "${clientId}" does not exist`,
    },
  });
}

function pairRequestSuccess(pairId: string) {
  return bufferify({
    method: 'pair_request_success',
    params: {
      pairId,
    },
  });
}

function pairRequestSent(pairId: string) {
  return bufferify({
    method: 'pair_request_sent',
    params: {
      pairId,
    },
  });
}

function pairRequestCancelled(pairId: string) {
  return bufferify({
    method: 'pair_request_cancelled',
    params: {
      pairId,
    },
  });
}

function pairRequestRejected(pairId: string) {
  return bufferify({
    method: 'pair_request_rejected',
    params: {
      pairId,
    },
  });
}

function proofRequestReceived(pluginHash: string) {
  return bufferify({
    method: 'proof_request_received',
    params: {
      pluginHash,
    },
  });
}

function proofRequestCancelled(pluginHash: string) {
  return bufferify({
    method: 'proof_request_cancelled',
    params: {
      pluginHash,
    },
  });
}

function proofRequestRejected(pluginHash: string) {
  return bufferify({
    method: 'proof_request_rejected',
    params: {
      pluginHash,
    },
  });
}

function bufferify(data: any) {
  return Buffer.from(JSON.stringify(data));
}

async function fetchPublicKeyFromNotary(notaryUrl: string) {
  const res = await fetch(notaryUrl + '/info');
  const json: any = await res.json();
  if (!json.publicKey) throw new Error('invalid response');
  return json.publicKey;
}

function safeParseJSON(data: string) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}
