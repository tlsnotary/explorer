export interface Proof {
  time: number;
  sent: string;
  recv: string;
  notaryUrl: string;
}

export type AttestationV0 = {
  version?: undefined;
  session: any;
  substrings: any;
  notaryUrl: string;
};

export type AttestationV1 = {
  version: '0.1.0-alpha.7' | '0.1.0-alpha.6';
  data: string;
  meta: {
    notaryUrl: string;
    websocketProxyUrl: string;
    pluginUrl?: string;
  };
};

export type Attestation = AttestationV0 | AttestationV1;
