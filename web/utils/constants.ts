export const EXPLORER_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://explorer-tlsn.pse.dev';
