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
import { verify as verifyV6 } from '../rs/0.1.0-alpha.6/index.node';
import { Attestation } from '../web/utils/types/types';

const app = express();
const port = 3000;

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
      const proof = await verify(
        file,
        await fetchPublicKeyFromNotary(jsonProof.notaryUrl),
      );
      proof.notaryUrl = jsonProof.notaryUrl;
      storeConfig.proofs.ipfs[req.params.cid].proof = proof;
    } else if (jsonProof.version === '1.0') {
      const proof = await verifyV6(
        jsonProof.data,
        await fetchPublicKeyFromNotary(jsonProof.meta.notaryUrl),
      );
      proof.notaryUrl = jsonProof.meta.notaryUrl;
      storeConfig.proofs.ipfs[req.params.cid].proof = proof;
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

app.listen(port, () => {
  console.log(`explorer server listening on port ${port}`);
});

async function fetchPublicKeyFromNotary(notaryUrl: string) {
  const res = await fetch(
    notaryUrl.replace('localhost', '127.0.0.1') + '/info',
  );
  const json: any = await res.json();

  if (!json.publicKey) throw new Error('invalid response');
  return json.publicKey;
}
