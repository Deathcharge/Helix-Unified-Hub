import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', process.argv.includes('--dist') ? 'dist' : 'docs');
const requestedPort = Number.parseInt(process.env.HELIX_HUB_PORT || '4173', 10);
const port = Number.isInteger(requestedPort) && requestedPort > 0 && requestedPort < 65536 ? requestedPort : 4173;
const mime = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.png', 'image/png'],
  ['.txt', 'text/plain; charset=utf-8']
]);

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', 'http://localhost');
    const decoded = decodeURIComponent(url.pathname);
    const requested = decoded.endsWith('/') ? `${decoded}index.html` : decoded;
    const target = path.resolve(root, `.${requested}`);
    if (target !== root && !target.startsWith(`${root}${path.sep}`)) throw new Error('Path escapes site root.');
    const info = await stat(target);
    if (!info.isFile()) throw new Error('Not a file.');
    response.writeHead(200, {
      'Content-Type': mime.get(path.extname(target).toLowerCase()) || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    createReadStream(target).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
    createReadStream(path.join(root, '404.html')).pipe(response);
  }
});

server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE'
    ? `Cannot start Helix Hub: 127.0.0.1:${port} is already in use. Set HELIX_HUB_PORT to another local port.`
    : `Cannot start Helix Hub: ${error.message}`);
  process.exitCode = 1;
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Helix Hub available at http://127.0.0.1:${port}/`);
});
