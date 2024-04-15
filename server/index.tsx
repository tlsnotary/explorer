import 'dotenv/config';
import express from 'express';
import fileUpload from 'express-fileupload';
import stream from 'stream';
import path from 'path';
import { addBytes, getCID } from './services/ipfs';
import App from '../web/pages/App';
import { Provider } from 'react-redux';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import configureAppStore from '../web/store';
// @ts-ignore
import { verify } from '../rs/verifier/index.node';
import htmlToImage from 'node-html-to-image';
import { IncomingMessage } from 'node:http';
import {createServer} from "http";
import {WebSocketServer, type RawData, type WebSocket} from "ws";
import crypto from "crypto";
import qs from 'qs';


const app = express();
const port = 3000;
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Cross-origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-origin-Opener-Policy','same-origin');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
});
app.use(express.static('build/ui'));
app.use(fileUpload({
  limits: { fileSize: 1024 * 1024 }, // 1mb file limit
}));

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
  const file = await getCID(req.params.cid);
  const jsonProof = JSON.parse(file);
  const proof = await verify(file, await fetchPublicKeyFromNotary(jsonProof.notaryUrl));
  proof.notaryUrl = jsonProof.notaryUrl;

  const store = configureAppStore({
    notaryKey: { key: '' },
    proofUpload: {
      proofs: [],
      selectedProof: null,
    },
    proofs: {
      ipfs: {
        [req.params.cid]: {
          raw: jsonProof,
          proof,
        }
      }
    }
  });
  const html = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url}>
        <App />
      </StaticRouter>
    </Provider>
  );


  const preloadedState = store.getState();

  const img = await htmlToImage({
    html: html,
  });

  const imgUrl= 'data:image/png;base64,' + img.toString('base64');

  console.log(imgUrl);
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta property="og:image" content="${imgUrl}" />
      <title>Popup</title>
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
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../ui', 'index.html'));
});

server.listen(port, () => {
  console.log(`explorer server listening on port ${port}`);
});

const clients: Map<string, WebSocket> = new Map<string, WebSocket>();
const pairs: Map<string, string> = new Map<string, string>();
pairs.set('alice', 'bob');
pairs.set('bob', 'alice');

wss.on("connection", (client: WebSocket, request: IncomingMessage) => {
  // you have a new client
  // add this client to the clients array

  let id = 0;
  const query = qs.parse((request.url || '').replace(/\/\?/g, ''))
  const clientId = (query?.clientId as string) || crypto.randomUUID();
  clients.set(clientId, client);
  console.log(`New Connection - ${clientId}`, );

  client.send(Buffer.from(JSON.stringify({
    method: 'client_connect',
    params: { clientId, id: id++ },
  })))

  // set up client event listeners:
  client.on("message", onClientMessage);
  client.on("close", endClient);

  function endClient() {
    clients.delete(clientId);
    console.log(`Connection closed - ${clientId}`);
  }

  function onClientMessage(rawData: RawData) {
    try {
      const msg = safeParseJSON(rawData.toString());

      console.log(`got msg from ${clientId}: `, msg);

      if (!msg) {
        const [cid] = clientId.split(':');
        const pairedClientId = pairs.get(cid);

        if (pairedClientId) {
          const target = clients.get(pairedClientId + ':proof');
          //@ts-ignore
          console.log('p2p: ', rawData.length);
          target!.send(rawData);
        }

        return;
      }

      switch (msg.method) {
        case 'chat': {
          const { from, to, text, id } = msg.params;
          const target = clients.get(to);
          if (target) {
            target.send(rawData);
          } else {
            client.send(Buffer.from(JSON.stringify({
              id,
              error: {
                message: `client "${to}" does not exist`,
              }
            })))
          }
          break;
        }
        case 'request_proof': {
          const { from, to, plugin, id } = msg.params;
          const target = clients.get(to);
          if (target) {
            target.send(rawData);
          } else {
            client.send(Buffer.from(JSON.stringify({
              id,
              error: {
                message: `client "${to}" does not exist`,
              }
            })))
          }
          break;
        }
        case 'pair_request': {
          const { to, id } = msg.params;
          const target = clients.get(to);
          if (target) {
            pairs.set(clientId, to);
            target.send(rawData);
          } else {
            client.send(Buffer.from(JSON.stringify({
              id,
              error: {
                message: `client "${to}" does not exist`,
              }
            })))
          }
          break;
        }
        case 'pair_request_success': {
          const { to, id } = msg.params;
          const target = clients.get(to);
          if (target) {
            pairs.set(clientId, to);
            target.send(rawData);
          } else {
            client.send(Buffer.from(JSON.stringify({
              id,
              error: {
                message: `client "${to}" does not exist`,
              }
            })))
          }
          break;
        }
        default:
          break;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // This function broadcasts messages to all webSocket clients
  function broadcast(data: string) {
    clients.forEach(c => c.send(data));
  }
});

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