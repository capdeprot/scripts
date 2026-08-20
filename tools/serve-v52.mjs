import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, normalize, resolve } from 'node:path';

const root = '/home/ubuntu/work_scriptz/scriptz-main-updated';
const port = Number(process.env.PORT || 4187);
const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json'
};

const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`).pathname;
    const requested = pathname === '/' ? '/index.html' : pathname;
    const file = resolve(root, `.${normalize(requested)}`);
    if (!file.startsWith(root) || !existsSync(file) || !(await stat(file)).isFile()) throw new Error('not found');
    response.writeHead(200, {
      'Content-Type': mime[extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Arquivo não encontrado');
  }
});

server.listen(port, '0.0.0.0', () => console.log(`Scriptz v52 disponível em http://localhost:${port}`));
