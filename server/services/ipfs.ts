import { createHelia, HeliaLibp2p } from 'helia';
import { unixfs } from '@helia/unixfs';

let node: HeliaLibp2p | null = null;

export async function getIPFS() {
  if (!node)
    node = await createHelia();

  return node;
}

export async function addBytes(buf: Buffer) {
  const ipfs = await getIPFS();
  const fs = unixfs(ipfs);
  const cid = await fs.addBytes(buf);
  return cid;
}