import express from 'express';
import fileUpload from 'express-fileupload';
import { addBytes } from './services/ipfs';

const app = express();
const port = 3000;


app.use(express.static('build/ui'));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 1024 * 1024 }, // 1mb file limit
}));

app.post('/upload', async (req, res) => {
  for (const file of Object.values(req.files!)) {
    console.log(file);
    // @ts-ignore
    const cid = await addBytes(file.data);
    res.send(cid.toString());
  }

  res.status(400).send({ error: true, message: 'request is missing file' });
});

app.listen(port, () => {
  console.log(`explorer server listening on port ${port}`);
});
