import { type RawData, type WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage, Server } from 'node:http';
import qs from 'qs';
import crypto from 'crypto';

const clients: Map<string, WebSocket> = new Map<string, WebSocket>();
const pairs: Map<string, string> = new Map<string, string>();

export function initWebsocketServer(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', async (client: WebSocket, request: IncomingMessage) => {
    const query = qs.parse((request.url || '').replace(/\/\?/g, ''));
    const clientId = (query?.clientId as string) || crypto.randomUUID();
    clients.set(clientId, client);
    console.log(`New Connection - ${clientId}`);

    if (!clientId.includes(':proof')) {
      await send(
        clientId,
        bufferify({
          method: 'client_connect',
          params: { clientId },
        }),
      );
    }

    // set up client event listeners:
    client.on('message', onClientMessage);
    client.on('close', endClient);

    async function endClient() {
      clients.delete(clientId);

      if (!clientId.includes(':proof')) {
        const pair = pairs.get(clientId);
        if (pair) {
          pairs.delete(pair);
          pairs.delete(clientId);
          await send(
            pair,
            bufferify({
              method: 'pair_disconnect',
              params: { pairId: clientId },
            }),
          );
        }
      }

      console.log(`Connection closed - ${clientId}`);
    }

    async function onClientMessage(rawData: RawData) {
      try {
        const msg = safeParseJSON(rawData.toString());

        if (!msg) {
          const [cid] = clientId.split(':');
          const pairedClientId = pairs.get(cid);
          await send(pairedClientId + ':proof', rawData);
          return;
        }

        const { to } = msg.params || {};

        switch (msg.method) {
          case 'pair_request':
          case 'pair_request_sent':
          case 'pair_request_cancel':
          case 'pair_request_cancelled':
          case 'pair_request_reject':
          case 'pair_request_rejected':
          case 'pair_request_accept':
          case 'request_proof':
          case 'request_proof_by_hash':
          case 'request_proof_by_hash_failed':
          case 'proof_request_received':
          case 'proof_request_accept':
          case 'verifier_started':
          case 'prover_setup':
          case 'prover_started':
          case 'proof_request_start':
          case 'proof_request_cancelled':
          case 'proof_request_rejected':
          case 'proof_request_cancel':
          case 'proof_request_reject':
          case 'proof_request_end':
            await send(to, rawData);
            break;
          case 'pair_request_success': {
            if (await send(to, rawData)) {
              pairs.set(to, clientId);
              pairs.set(clientId, to);
            }
            break;
          }
          case 'ping':
            break;
          default:
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
      return new Promise((resolve) => {
        const target = clients.get(clientId);

        if (!target) {
          client.send(
            bufferify({
              error: {
                message: `client "${clientId}" does not exist`,
              },
            }),
            (err) => {
              resolve(false);
            },
          );
        } else {
          target.send(data, (err) => {
            resolve(!err);
          });
        }
      });
    }
  });
}

function bufferify(data: any) {
  return Buffer.from(JSON.stringify(data));
}

function safeParseJSON(data: string) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}
