import { createHelia, HeliaLibp2p } from 'helia';
import { unixfs } from '@helia/unixfs';
import { CID } from 'multiformats/cid'


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

export async function getCID(hash: string) {
  const ipfs = await getIPFS();
  const cid = CID.parse(hash);
  const file = await ipfs.blockstore.get(cid);
  return file;
}