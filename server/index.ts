import express from 'express';
const app = express();
const port = 3000;

app.use(express.static('build/ui'));

app.listen(port, () => {
  console.log(`explorer server listening on port ${port}`);
});
