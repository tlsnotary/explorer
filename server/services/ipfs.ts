import { CID } from 'multiformats/cid'
import FormData from 'form-data';
const JWT = process.env.PINATA_JWT;

console.log(FormData);
export async function addBytes(file: Buffer) {
  const formData = new FormData();
  formData.append("file", file);
  const pinataMetadata = JSON.stringify({
    name: "proof.json",
  });
  formData.append("pinataMetadata", pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 1,
  });
  formData.append("pinataOptions", pinataOptions);
  // const ipfs = await getIPFS();
  // const fs = unixfs(ipfs);
  // const cid = await fs.addBytes(buf);
  // return cid;
}

export async function getCID(hash: string) {
  // const ipfs = await getIPFS();
  // const cid = CID.parse(hash);
  // const file = await ipfs.blockstore.get(cid);
  // return file;
}