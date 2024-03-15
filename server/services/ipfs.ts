import pinataSDK from '@pinata/sdk';
import { Readable } from 'stream';
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);


export async function addBytes(file: Buffer) {
  const res = await pinata.pinFileToIPFS(Readable.from(file), {
    pinataMetadata: {
      name: 'proof.json',
    },
    pinataOptions: {
      cidVersion: 1
    }
  });

  if (res.IpfsHash) return res.IpfsHash;
  return null;
}

export async function getCID(hash: string) {
  console.log(process.env.PINATA_GATEWAY + '/' + hash);
  const res = await fetch(process.env.PINATA_GATEWAY + '/ipfs/' + hash, {
    headers: {
      'x-pinata-gateway-token': process.env.PINATA_GATEWAY_KEY!,
    }
  });

  return res.text();
}