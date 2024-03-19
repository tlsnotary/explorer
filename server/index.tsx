import 'dotenv/config';
import express from 'express';
import fileUpload from 'express-fileupload';
import stream from 'stream';
import path from 'path';
import { addBytes, getCID } from './services/ipfs';
import store from '../web/store';
import App from '../web/pages/App';
import { Provider } from 'react-redux';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import * as fs from 'fs';

const app = express();
const port = 3000;

const indexHTML = fs.readFileSync(path.join(__dirname, '../ui', 'index.html'), 'utf-8');

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

app.get('/:cid', async (req, res) => {
  const html = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url}>
        <App />
      </StaticRouter>
    </Provider>
  );

  res.send(indexHTML.replace('<div id="root"></div>', `<div id="root">${html}</div>`));
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../ui', 'index.html'));
});

app.listen(port, () => {
  console.log(`explorer server listening on port ${port}`);
});
