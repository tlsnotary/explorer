export function convertNotaryWsToHttp(notaryWs: string) {
  const { protocol, pathname, hostname, port } = new URL(notaryWs);
  const p = protocol === 'wss:' ? 'https:' : 'http:';
  const pt = port ? `:${port}` : '';
  const path = pathname === '/' ? '' : pathname.replace('/notarize', '');
  const h = hostname === 'localhost' ? '127.0.0.1' : hostname;
  return p + '//' + h + pt + path;
}
